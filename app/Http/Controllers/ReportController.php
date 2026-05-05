<?php

namespace App\Http\Controllers;

use App\Models\Branch\Branch;
use App\Models\Branch\BranchDay;
use App\Models\Branch\BranchHoliday;
use App\Models\Firm\Firm;
use App\Models\Firm\FirmHoliday;
use App\Models\Worker\Worker;
use App\Models\Worker\WorkerDay;
use App\Models\Worker\WorkerHoliday;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonPeriod;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use function Pest\Laravel\from;

class ReportController extends Controller
{
    public function salary_report(Request $request)
    {
        try {

            $request->validate([
                'from' => 'nullable',
                'to' => 'nullable',
                'worker_id' => 'nullable',
                'branch_id' => 'nullable',
                'firm_id' => 'nullable',
            ]);


            if ($request->per_page) {
                $per_page = $request->per_page;
            } else {
                $per_page = 10;
            }

            $days = $this->countWorkingDays($request);


            $query = \App\Models\Attendance\Attendance::query()
                ->join('workers as w', 'w.id', '=', 'attendances.worker_id')
                ->join('branches as b', 'w.branch_id', '=', 'b.id')
                ->join('firms as f', 'b.firm_id', '=', 'f.id')
                ->whereNotNull('attendances.to_datetime');

            if ($request->from && $request->to) {
                $query->whereBetween('attendances.work_date', [$request->from, $request->to]);
            }
            if ($request->worker_id) {
                $query->where('w.id', $request->worker_id);
            }
            if ($request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('w.name', 'like', '%' . $request->search . '%')
                        ->orWhere('b.name', 'like', '%' . $request->search . '%')
                        ->orWhere('f.name', 'like', '%' . $request->search . '%');
                });
            }
            if ($request->branch_id) {
                $query->where('b.id', $request->branch_id);
            }
            if ($request->firm_id) {
                $query->where('f.id', $request->firm_id);
            }

            if (!Auth::user()->hasRole('Admin')) {
                $firmIds = Auth::user()->user_firms()->pluck('firm_id');
                $query->whereIn('f.id', $firmIds);
            }

            $results = (clone $query)
                ->select(
                    'attendances.worker_id',
                    'w.name as worker',
                    'w.phone',
                    'b.name as branch',
                    'f.name as firm',
                    'attendances.work_time',
                    'attendances.end_time',
                    'attendances.from_datetime as from',
                    'attendances.to_datetime as to',
                    'attendances.worked_minutes',
                    'attendances.break_minutes',
                    'attendances.comment',
                    DB::raw('IF(attendances.late_minutes > 0, attendances.late_minutes, 0) as late_minutes'),
                    DB::raw('IF(attendances.type = "break", "Dam olish (Break)", IF(attendances.is_night_shift, "Tungi Smena", "Kunduzgi Smena")) as status')
                )
                ->orderBy('worker')
                ->orderBy('from', 'desc')
                ->paginate($per_page);

            $resultsForReport = (clone $query)
                ->select(
                    'attendances.worker_id',
                    'w.name as worker',
                    'attendances.work_date',
                    'attendances.from_datetime as from',
                    'attendances.worked_minutes',
                    'attendances.break_minutes',
                    DB::raw('IF(attendances.late_minutes > 0, attendances.late_minutes, 0) as late_minutes')
                )
                ->get();

//            dd($resultsForReport);

            $groupedByDate = $resultsForReport->groupBy(function ($item) {
                return $item->worker_id . '|' . $item->work_date;
            });

            $report = new \stdClass();
            $report->working_days = $days;
            $report->worked_days = $groupedByDate->count(); // count of unique worked days
            $report->worked_minutes = $resultsForReport->sum('worked_minutes');
            $report->break_minutes = $resultsForReport->sum('break_minutes');
            $report->late_minutes = $resultsForReport->sum('late_minutes');
            $report->late_days = $groupedByDate->filter(function ($items) {
                return $items->sum('late_minutes') > 0;
            })->count();
            if ($request->worker_id) {
                $worker = Worker::find($request->worker_id);
                $report->last_salary_date = $worker->salaries->max('to');
                $report->hour_price = $worker->hour_price;
                $report->fine_price = $worker->fine_price;
                $report->work_time = $worker->work_time;
                $report->end_time = $worker->end_time;
            }
            $report->from = $request->from;
            $report->to = $request->to;


            $firms = Firm::with([]);
            $branches = Branch::with([]);
            $workers = Worker::with([]);

            if (!Auth::user()->hasRole('Admin')) {
                $firms->whereHas('user_firms', function ($query) {
                    $query->where('user_id', Auth::id());
                });

                $branches = $branches->whereHas('firm', function ($query) {
                    $query->whereHas('user_firms', function ($query) {
                        $query->where('user_id', Auth::id());
                    });
                });

                $workers = $workers->whereHas('branch', function ($query) {
                    $query->whereHas('firm', function ($query) {
                        $query->whereHas('user_firms', function ($query) {
                            $query->where('user_id', Auth::id());
                        });
                    });
                });
            }

            $firms = $firms->get();
            $branches = $branches->get();
            $workers = $workers->get();

            return Inertia::render('salary_report/index', [
                'report' => $report,
                'attendance' => $results,
                'firms' => $firms,
                'branches' => $branches,
                'workers' => $workers,
            ]);

        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }


    public function countWorkingDays(Request $request): int
    {
        $workerId = $request->worker_id > 0 ? $request->worker_id : null;
        $branchId = $request->branch_id > 0 ? $request->branch_id : null;
        $firmId = $request->firm_id > 0 ? $request->firm_id : null;
        $from = Carbon::parse($request->from);
        $to = Carbon::parse($request->to);

        // Generate date range using CarbonPeriod
        $dates = collect(CarbonPeriod::create($from, $to))->map(fn($d) => $d->copy()->startOfDay());

        $worker = Worker::find($workerId);

        $effectiveBranchId = $branchId ?? $worker?->branch_id;

        $branch = WorkerDay::where('worker_id', $workerId)->get();

        if (count($branch) == 0) {
            $branch = BranchDay::where('branch_id', $effectiveBranchId)->get();
        }

        // Load branch working days
        $workingDayIndexes = $branch
            ? $branch->pluck('day.index')->toArray()
            : range(1, 7); // Default: all days are working days if branch not given

        return $dates->filter(function ($date) use ($workerId, $branchId, $firmId, $workingDayIndexes) {
            $dayOfWeek = $date->dayOfWeekIso;

            if (!in_array($dayOfWeek, $workingDayIndexes)) {
                return false;
            }

            $isWorkerOnHoliday = $workerId && WorkerHoliday::where('worker_id', $workerId)
                    ->whereDate('from', '<=', $date)
                    ->whereDate('to', '>=', $date)
                    ->exists();

            $isBranchHolidayWorker = $workerId && BranchHoliday::whereHas('branch', function ($q) use ($workerId) {
                    $q->whereHas('workers', function ($q) use ($workerId) {
                        $q->where('workers.id', $workerId);
                    });
                })
                    ->whereDate('date', $date)
                    ->exists();

            $isFirmHolidayWorker = $workerId && FirmHoliday::whereHas('firm', function ($q) use ($workerId) {
                    $q->whereHas('branches', function ($q) use ($workerId) {
                        $q->whereHas('workers', function ($q) use ($workerId) {
                            $q->where('workers.id', $workerId);
                        });
                    });
                })
                    ->whereDate('date', $date)
                    ->exists();


            $isBranchHoliday = $branchId && BranchHoliday::where('branch_id', $branchId)
                    ->whereDate('date', $date)
                    ->exists();

            $isFirmHolidayBranch = $branchId && FirmHoliday::whereHas('firm', function ($q) use ($branchId) {
                    $q->whereHas('branches', function ($q) use ($branchId) {
                        $q->where('branches.id', $branchId);
                    });
                })
                    ->whereDate('date', $date)
                    ->exists();


            $isFirmHoliday = $firmId && FirmHoliday::where('firm_id', $firmId)
                    ->whereDate('date', $date)
                    ->exists();

            return !$isWorkerOnHoliday && !$isBranchHoliday && !$isFirmHoliday && !$isBranchHolidayWorker && !$isFirmHolidayWorker && !$isFirmHolidayBranch;
        })->count();
    }


    public function monthly_attendance(Request $request)
    {
        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        if ($request->from && $request->to) {
            $from = $request->from;
            $to = $request->to;
        } else {
            $from = Carbon::now()->startOfMonth()->toDateString();
            $to = Carbon::now()->endOfMonth()->toDateString();
        }

//        $workers = Worker::with([
//            'HikvisionAccessEvents' => function ($query) use ($monthNumber, $year) {
//                $query->whereMonth('created_at', $monthNumber)
//                    ->whereYear('created_at', $year)
//                    ->where('attendanceStatus', "checkIn");
//            }
//        ])
//            ->select(
//                'workers.*'
//            );
//
//        if ($request->firm_id) {
//            $workers = $workers->whereHas('branch', function ($query) use ($request) {
//                $query->where('firm_id', $request->firm_id);
//            });
//        }
//
//        if ($request->branch_id) {
//            $workers = $workers->where('branch_id', $request->branch_id);
//        }


        $resultsForReport = Worker::query()
            ->leftJoin('attendances as a', function($join) use ($from, $to) {
                $join->on('workers.id', '=', 'a.worker_id')
                    ->whereNotNull('a.to_datetime')
                    ->whereBetween('a.work_date', [$from, $to]);
            })
            ->select(
                'workers.*',
                DB::raw('COALESCE(SUM(a.worked_minutes), 0) AS worked_minutes'),
                DB::raw('COALESCE(SUM(a.break_minutes), 0) AS break_minutes'),
                DB::raw('COALESCE(SUM(IF(a.late_minutes > 0, a.late_minutes, 0)), 0) AS late_minutes'),
                DB::raw('COUNT(DISTINCT IF(a.type = "work", a.work_date, NULL)) AS worked_days'),
                DB::raw('SUM(IF(a.late_minutes > 0 AND a.is_first_check_in, 1, 0)) AS late_days'),
                DB::raw("count_working_days(workers.id,'$from','$to') as work_days")
            )
            ->groupBy('workers.id')
            ->orderByDesc('worked_minutes');

        if ($request->search) {
            $resultsForReport->where(function ($query) use ($request) {
                $query->where('workers.name', 'like', "%{$request->search}%")
                    ->orWhere('workers.phone', 'like', "%{$request->search}%")
                    ->orWhere('workers.address', 'like', "%{$request->search}%")
                    ->orWhere('workers.comment', 'like', "%{$request->search}%");
            });
        }

        if ($request->branch_id) {
            $resultsForReport->where('workers.branch_id', $request->branch_id);
        }

        if ($request->firm_id) {
            $resultsForReport->whereHas('branch', function ($query) use ($request) {
                $query->where('firm_id', '=', $request->firm_id);
            });
        }


        $firms = Firm::with([]);
        $branches = Branch::with([]);

        if (!Auth::user()->hasRole('Admin')) {
            $firms->whereHas('user_firms', function ($query) {
                $query->where('user_id', Auth::id());
            });

            $branches = $branches->whereHas('firm', function ($query) {
                $query->whereHas('user_firms', function ($query) {
                    $query->where('user_id', Auth::id());
                });
            });

            $resultsForReport = $resultsForReport
                ->whereHas('branch', function ($query) {
                    $query->whereHas('firm', function ($query) {
                        $query->whereHas('user_firms', function ($query) {
                            $query->where('user_id', Auth::id());
                        });
                    });
                });
        }

        $firms = $firms->get();
        $branches = $branches->get();

        $resultsForReport = $resultsForReport
            ->paginate($per_page);

        return Inertia::render('monthly_report/index', [
            'worker' => $resultsForReport,
            'firms' => $firms,
            'branches' => $branches,
        ]);
    }


}

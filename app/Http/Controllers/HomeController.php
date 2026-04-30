<?php

namespace App\Http\Controllers;

use App\Models\Branch\Branch;
use App\Models\Firm\Firm;
use App\Models\Worker\Worker;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {

        if ($request->month) {
            $month = $request->month;
            $monthNumber = Carbon::parse($month)->month;
            $year = Carbon::parse($month)->year;
        } else {
            $month = date('Y-m'); // '2025-05'
            $monthNumber = date('m'); // '05'
            $year = date('Y'); // '2025'
        }

        $allWorker = Worker::with([]);

        if (!Auth::user()->hasRole('Admin')) {
            $allWorker = $allWorker->whereHas('branch', function ($query) {
                $query->whereHas('firm', function ($query) {
                    $query->whereHas('user_firms', function ($query) {
                        $query->where('user_id', Auth::id());
                    });
                });
            });
        }

        if ($request->branch_id) {
            $allWorker = $allWorker->where('branch_id', $request->branch_id);
        }

        if ($request->firm_id) {
            $allWorker = $allWorker->whereHas('branch', function ($query) use ($request) {
                $query->where('firm_id', $request->firm_id);
            });
        }

        $allWorkerCount = $allWorker->count('workers.id');

        // Not Come (Absent)
        $notComeQuery = (clone $allWorker)->whereDoesntHave('attendances', function ($q) {
            $q->where('work_date', date('Y-m-d'))->where('type', 'work');
        });
        $notCome = $notComeQuery->count('workers.id');

        // On Holiday
        $onHolidayQuery = (clone $allWorker)->whereHas('worker_holidays', function ($query) {
            $query->whereDate(DB::raw('CURDATE()'), '>=', DB::raw('`from`'))
                ->whereDate(DB::raw('CURDATE()'), '<=', DB::raw('`to`'));
        });
        $onHoliday = $onHolidayQuery->count('workers.id');

        // Attendance Stats (On Time / Late)
        $statsQuery = \App\Models\Attendance\Attendance::query()
            ->join('workers as w', 'w.id', '=', 'attendances.worker_id')
            ->where('attendances.work_date', date('Y-m-d'))
            ->where('attendances.type', 'work')
            ->where('attendances.is_first_check_in', true);

        if (!Auth::user()->hasRole('Admin')) {
            $skladIds = Auth::user()->user_firms()->pluck('firm_id');
            $statsQuery->whereHas('worker.branch', function($q) use ($skladIds) {
                $q->whereIn('firm_id', $skladIds);
            });
        }
        if ($request->branch_id) {
            $statsQuery->where('w.branch_id', $request->branch_id);
        }
        if ($request->firm_id) {
            $statsQuery->whereHas('worker.branch', function($q) use ($request) {
                $q->where('firm_id', $request->firm_id);
            });
        }

        $attendanceResults = $statsQuery->selectRaw('
            SUM(CASE WHEN attendances.late_minutes = 0 THEN 1 ELSE 0 END) AS on_time,
            SUM(CASE WHEN attendances.late_minutes > 0 THEN 1 ELSE 0 END) AS late
        ')->first();

        // Gone (Finished work)
        $goneQuery = \App\Models\Attendance\Attendance::query()
            ->join('workers as w', 'w.id', '=', 'attendances.worker_id')
            ->where('attendances.work_date', date('Y-m-d'))
            ->where('attendances.type', 'work')
            ->whereNotNull('attendances.to_datetime');

        if (!Auth::user()->hasRole('Admin')) {
            $skladIds = Auth::user()->user_firms()->pluck('firm_id');
            $goneQuery->whereHas('worker.branch', function($q) use ($skladIds) {
                $q->whereIn('firm_id', $skladIds);
            });
        }
        if ($request->branch_id) {
            $goneQuery->where('w.branch_id', $request->branch_id);
        }
        if ($request->firm_id) {
            $goneQuery->whereHas('worker.branch', function($q) use ($request) {
                $q->where('firm_id', $request->firm_id);
            });
        }
        $gone = $goneQuery->count();

        $onTime = $attendanceResults->on_time ?? 0;
        $late = $attendanceResults->late ?? 0;

        $stats = [
            'all_worker' => $allWorkerCount,
            'absent' => $notCome,
            'on_holiday' => $onHoliday,
            'on_time' => (int) $onTime,
            'late' => (int) $late,
            'gone' => $gone,
        ];


        $query = \App\Models\Attendance\Attendance::query()
            ->join('workers as w', 'w.id', '=', 'attendances.worker_id')
            ->join('branches as b', 'w.branch_id', '=', 'b.id')
            ->join('firms as f', 'b.firm_id', '=', 'f.id')
            ->whereMonth('attendances.work_date', $monthNumber)
            ->whereYear('attendances.work_date', $year);

        if ($request->from && $request->to) {
            $query->whereBetween('attendances.work_date', [$request->from, $request->to]);
        }

        if ($request->branch_id) {
            $query->where('b.id', $request->branch_id);
        }
        if ($request->firm_id) {
            $query->where('f.id', $request->firm_id);
        }

        if (!Auth::user()->hasRole('Admin')) {
            $skladIds = Auth::user()->user_firms()->pluck('firm_id');
            $query->whereIn('f.id', $skladIds);
        }

        $resultsForHisobot = (clone $query)
            ->select(
                'attendances.work_date as worked_date',
                DB::raw('sum(IF(attendances.type = "work", attendances.worked_minutes, 0)) / 60 as worked_hours'),
                DB::raw('sum(IF(attendances.type = "break", attendances.break_minutes, 0)) / 60 as break_hours'),
                DB::raw('sum(IF(attendances.late_minutes > 0, attendances.late_minutes, 0)) / 60 as late_hours'),
            )
            ->groupBy('attendances.work_date')
            ->orderBy('attendances.work_date')
            ->get();


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
        }

        $firms = $firms->get();
        $branches = $branches->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'daily_stats' => $resultsForHisobot,
            'firms' => $firms,
            'branches' => $branches,
        ]);


    }
}

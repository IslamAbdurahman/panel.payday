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

        $allWorker = $allWorker->count('workers.id');


        $notCome = Worker::with([])
            ->leftJoin('hikvision_access_events as hae', function ($join) {
                $join->on('hae.employeeNoString', '=', 'workers.employeeNoString')
                    ->whereRaw('CURDATE() = DATE(hae.created_at)');
            })
            ->whereNull('hae.id');

        if (!Auth::user()->hasRole('Admin')) {
            $notCome = $notCome->whereHas('branch', function ($query) {
                $query->whereHas('firm', function ($query) {
                    $query->whereHas('user_firms', function ($query) {
                        $query->where('user_id', Auth::id());
                    });
                });
            });
        }

        if ($request->branch_id) {
            $notCome = $notCome->where('branch_id', $request->branch_id);
        }

        if ($request->firm_id) {
            $notCome = $notCome->whereHas('branch', function ($query) use ($request) {
                $query->where('firm_id', $request->firm_id);
            });
        }

        $notCome = $notCome->count('workers.id');


        $onHoliday = Worker::with([])
            ->whereHas('worker_holidays' , function ($query) {
                $query->whereDate(DB::raw('CURDATE()'), '>=', DB::raw('`from`'))
                    ->whereDate(DB::raw('CURDATE()'), '<=', DB::raw('`to`'));
            })
            ->groupBy('workers.id')
            ->distinct('workers.id');

        if (!Auth::user()->hasRole('Admin')) {
            $onHoliday = $onHoliday->whereHas('branch', function ($query) {
                $query->whereHas('firm', function ($query) {
                    $query->whereHas('user_firms', function ($query) {
                        $query->where('user_id', Auth::id());
                    });
                });
            });
        }

        if ($request->branch_id) {
            $onHoliday = $onHoliday->where('branch_id', $request->branch_id);
        }

        if ($request->firm_id) {
            $onHoliday = $onHoliday->whereHas('branch', function ($query) use ($request) {
                $query->where('firm_id', $request->firm_id);
            });
        }

        $onHoliday = $onHoliday->count('workers.id');


        $result = Worker::with([])
            ->join(DB::raw('(
        SELECT hae.*
        FROM hikvision_access_events hae
        WHERE DATE(hae.created_at) = CURDATE()
        AND hae.attendanceStatus IN ("CheckIn", "entered")
        AND hae.created_at = (
            SELECT MIN(created_at)
            FROM hikvision_access_events
            WHERE DATE(created_at) = CURDATE()
            AND employeeNoString = hae.employeeNoString
            AND attendanceStatus IN ("CheckIn", "entered")
        )
        GROUP BY DATE(hae.created_at), hae.employeeNoString
    ) AS first_event'), 'workers.employeeNoString', '=', 'first_event.employeeNoString')
            ->selectRaw('
        SUM(CASE WHEN TIME(first_event.created_at) <= TIME(first_event.work_time) THEN 1 ELSE 0 END) AS on_time,
        SUM(CASE WHEN TIME(first_event.created_at) > TIME(first_event.work_time) THEN 1 ELSE 0 END) AS late
    ');

        if (!Auth::user()->hasRole('Admin')) {
            $result = $result->whereHas('branch', function ($query) {
                $query->whereHas('firm', function ($query) {
                    $query->whereHas('user_firms', function ($query) {
                        $query->where('user_id', Auth::id());
                    });
                });
            });
        }

        if ($request->branch_id) {
            $result = $result->where('branch_id', $request->branch_id);
        }

        if ($request->firm_id) {
            $result = $result->whereHas('branch', function ($query) use ($request) {
                $query->where('firm_id', $request->firm_id);
            });
        }

        $result = $result->first();

        $gone = Worker::with([])
            ->join(DB::raw('(
            SELECT hae.*
            FROM hikvision_access_events hae
            WHERE DATE(hae.created_at) = CURDATE()
              AND hae.attendanceStatus IN ("checkOut")
              AND hae.created_at = (
                  SELECT MAX(created_at)
                  FROM hikvision_access_events
                  WHERE DATE(created_at) = CURDATE()
                    AND employeeNoString = hae.employeeNoString
              )
            GROUP BY DATE(hae.created_at), hae.employeeNoString
        ) AS first_event'), 'workers.employeeNoString', '=', 'first_event.employeeNoString');


        if (!Auth::user()->hasRole('Admin')) {
            $gone = $gone->whereHas('branch', function ($query) {
                $query->whereHas('firm', function ($query) {
                    $query->whereHas('user_firms', function ($query) {
                        $query->where('user_id', Auth::id());
                    });
                });
            });
        }

        if ($request->branch_id) {
            $gone = $gone->where('branch_id', $request->branch_id);
        }

        if ($request->firm_id) {
            $gone = $gone->whereHas('branch', function ($query) use ($request) {
                $query->where('firm_id', $request->firm_id);
            });
        }

        $gone = $gone->count();


        $onTime = $result->on_time ?? 0;
        $late = $result->late ?? 0;

        $stats = [
            'all_worker' => $allWorker ?? 0,
            'absent' => $notCome ?? 0,
            'on_holiday' => $onHoliday ?? 0,
            'on_time' => (int) $onTime,
            'late' => (int) $late,
            'gone' => $gone ?? 0,
        ];


        $baseQuery = DB::table('hikvision_access_events as hae')
            ->select(
                'hae.id',
                'w.name as worker',
                'b.name as branch',
                'w.branch_id',
                'b.firm_id',
                'hae.work_time',
                'f.name as firm',
                'hae.attendanceStatus',
                'hae.label',
                'hae.created_at',
                DB::raw("ROW_NUMBER() OVER (PARTITION BY w.name ORDER BY hae.created_at) AS rn")
            )
            ->join('workers as w', 'w.employeeNoString', '=', 'hae.employeeNoString')
            ->join('branches as b', 'w.branch_id', '=', 'b.id')
            ->join('firms as f', 'b.firm_id', '=', 'f.id');

        $baseQuery->whereMonth('hae.created_at', $monthNumber)
            ->whereYear('hae.created_at', $year);

        if ($request->from && $request->to) {
            $baseQuery->whereBetween('hae.created_at', [$request->from, $request->to . " 23:59:59"]);
        }

        if ($request->branch_id) {
            $baseQuery->where('b.id', $request->branch_id);
        }
        if ($request->firm_id) {
            $baseQuery->where('f.id', $request->firm_id);
        }

        if (!Auth::user()->hasRole('Admin')) {
            $skladIds = Auth::user()->user_firms()->pluck('firm_id');

            $baseQuery->whereIn('f.id', $skladIds);
        }

// Create derived tables with aliases e1 and e2
        $e1 = DB::raw("({$baseQuery->toSql()}) as e1");
        $e2 = DB::raw("({$baseQuery->toSql()}) as e2");

// Build paired events
        $pairedEvents = DB::table($e1)
            ->mergeBindings($baseQuery)
            ->join($e2, function ($join) {
                $join->on('e1.worker', '=', 'e2.worker')
                    ->whereRaw('e2.rn = e1.rn + 1');
            })
            ->mergeBindings($baseQuery)
            ->where(function ($query) {
                $query->where(function ($q) {
                    $q->whereIn('e1.attendanceStatus', ['keldi', 'CheckIn', 'entered'])
                        ->whereIn('e2.attendanceStatus', ['ketdi', 'CheckOut', 'exited']);
                })->orWhere(function ($q) {
                    $q->whereIn('e1.attendanceStatus', ['Obetga ketdi', 'BreakOut'])
                        ->whereIn('e2.attendanceStatus', ['Obetdan keldi', 'BreakIn']);
                });
            })
            ->select(
                'e1.worker',
                'e1.branch',
                'e1.branch_id',
                'e1.firm_id',
                'e1.work_time',
                'e1.firm',
                DB::raw('e1.created_at as from_time'),
                DB::raw('e2.created_at as to_time'),
                DB::raw('e1.attendanceStatus as status_from'),
                DB::raw("CONCAT(e1.label, '/', e2.label) as status"),
                DB::raw("CASE
                    WHEN e1.attendanceStatus IN ('keldi', 'CheckIn', 'entered')
                    THEN TIMESTAMPDIFF(MINUTE, TIMESTAMP(DATE(e1.created_at), e1.work_time), e1.created_at)
                    ELSE 0 END as late_minutes"),
                DB::raw("CASE
                    WHEN e1.attendanceStatus IN ('keldi', 'CheckIn', 'entered')
                    THEN TIMESTAMPDIFF(MINUTE, e1.created_at, e2.created_at)
                    ELSE 0 END as worked_minutes"),
                DB::raw("CASE
                    WHEN e1.attendanceStatus IN ('Obetga ketdi', 'BreakOut')
                    THEN TIMESTAMPDIFF(MINUTE, e1.created_at, e2.created_at)
                    ELSE 0 END as break_minutes")
            );


// Final select Hisobot
        $resultsForHisobot = DB::table(DB::raw("({$pairedEvents->toSql()}) as paired_events"))
            ->mergeBindings($pairedEvents)
            ->select(
                DB::raw('date(from_time) as worked_date'),

                DB::raw('sum(worked_minutes) / 60 as worked_hours'),
                DB::raw('sum(break_minutes) / 60 as break_hours'),
                DB::raw('sum(IF(late_minutes > 0, late_minutes, 0)) / 60 as late_hours'),
            )
            ->groupBy(DB::raw('date(from_time)'))
            ->orderBy('from_time')
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

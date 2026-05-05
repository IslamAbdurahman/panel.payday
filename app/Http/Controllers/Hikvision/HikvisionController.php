<?php

namespace App\Http\Controllers\Hikvision;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFaceRectRequest;
use App\Http\Requests\UpdateFaceRectRequest;
use App\Models\Branch\Branch;
use App\Models\Firm\Firm;
use App\Models\Attendance\Attendance;
use App\Models\Hikvision\FaceRect;
use App\Models\Hikvision\HikvisionAccess;
use App\Models\Hikvision\HikvisionAccessEvent;
use App\Models\Worker\Worker;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class HikvisionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function attendance(Request $request)
    {
        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        if ($request->month) {
            $month = $request->month;
            $monthNumber = Carbon::parse($month)->month;
            $year = Carbon::parse($month)->year;
        } else {
            $month = date('Y-m'); // '2025-05'
            $monthNumber = date('m'); // '05'
            $year = date('Y'); // '2025'
        }

        $currentMonth = Carbon::now()->format('Y-m'); // '2025-05'
        $currentDay = Carbon::now()->day; // Get the current day of the month (e.g., 12 for May 12)

        if ($month === $currentMonth || empty($month)) {
            $daysInMonth = $currentDay;
        } else {
            $daysInMonth = Carbon::create($year, $monthNumber, 1)->daysInMonth;
        }

        $workers = Worker::with([
            'attendances' => function ($query) use ($monthNumber, $year) {
                $query->where('type', 'work')
                    ->whereMonth('work_date', $monthNumber)
                    ->whereYear('work_date', $year)
                    ->select('worker_id', 'work_date', 'from_datetime', 'to_datetime', 'work_time');
            }
        ])
            ->select(
                'workers.*'
            );

        if ($request->firm_id) {
            $workers = $workers->whereHas('branch', function ($query) use ($request) {
                $query->where('firm_id', $request->firm_id);
            });
        }

        if ($request->branch_id) {
            $workers = $workers->where('branch_id', $request->branch_id);
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
        $workers = $workers->paginate($per_page);

        $workers->getCollection()->transform(function ($worker) use ($month) {
            $worker->holidays = $worker->getHoliday($month);

            // Map attendances to hikvision_access_events for frontend compatibility
            $worker->hikvision_access_events = $worker->attendances->flatMap(function ($attendance) {
                $events = [];
                if ($attendance->from_datetime) {
                    $events[] = [
                        'created_at' => $attendance->from_datetime->toDateTimeString(),
                        'work_time' => $attendance->work_time,
                        'attendanceStatus' => 'checkIn',
                    ];
                }
                if ($attendance->to_datetime) {
                    $events[] = [
                        'created_at' => $attendance->to_datetime->toDateTimeString(),
                        'work_time' => $attendance->work_time,
                        'attendanceStatus' => 'checkOut',
                    ];
                }
                return $events;
            });

            return $worker;
        });

        return Inertia::render('attendance/index', [
            'worker' => $workers,
            'daysInMonth' => $daysInMonth,
            'firms' => $firms,
            'branches' => $branches,
        ]);
    }

    public function daily_attendance(Request $request, Branch $branch)
    {
        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

        if ($request->date) {
            $date = $request->date;
        } else {
            $date = date('Y-m-d'); // '2025-05-12'
        }

        $workers = Worker::with([
            'attendances' => function ($query) use ($date) {
                $query->where('work_date', $date)
                    ->orderBy('from_datetime', 'asc');
            }
        ])
            ->where('branch_id', '=', $branch->id)
            ->select('workers.*');

        if (!Auth::user()->hasRole('Admin')) {
            $workers->whereHas('branch.firm.user_firms', function ($query) {
                $query->where('user_id', Auth::id());
            });
        }

        $workers = $workers->paginate($per_page);

        return Inertia::render('daily_attendance/index', [
            'worker' => $workers,
            'branch' => $branch,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFaceRectRequest $request)
    {
        try {
            $rawEvent = $request->AccessControllerEvent;
            $eventData = is_string($rawEvent) ? json_decode($rawEvent) : json_decode(json_encode($rawEvent));

            if (isset($eventData->AccessControllerEvent->attendanceStatus)) {
//                \Illuminate\Support\Facades\Log::info('Hikvision Event:', $request->all());

                telegramlog('Hikvision Event qabul qilindi.');

                // Aynan siz xohlagan formatni shakllantiramiz
                $prettyRequest = $request->all();
                if (isset($prettyRequest['AccessControllerEvent'])) {
                    // Agar array bo'lsa, uni string ko'rinishiga keltiramiz
                    $prettyRequest['AccessControllerEvent'] = is_string($prettyRequest['AccessControllerEvent'])
                        ? $prettyRequest['AccessControllerEvent']
                        : json_encode($prettyRequest['AccessControllerEvent'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                }

                // Tayyor stringni telegramlog-ga uzatamiz
                telegramlog(json_encode($prettyRequest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

                $filename = '';
                if ($request->hasFile('Picture')) {
                    $picture = $request->file('Picture');

                    // Fayl nomini generatsiya qilish (ixtiyoriy)
                    $filename = time() . '_' . rand(1, 50) . '_' . $picture->getClientOriginalName();

                    // Saqlash
                    $savedPath = $picture->storeAs("hikvision/$eventData->shortSerialNumber", $filename, 'public'); // 3-chi parametr: 'public'

                    // Matnli xabar yuborish (rasmsiz)
                    $caption = 'Foydalanuvchi: ' . ($eventData->AccessControllerEvent->name ?? 'Noma\'lum') .
                        "\nHolati: " . ($eventData->AccessControllerEvent->attendanceStatus ?? 'Noma\'lum') .
                        "\nPath : $savedPath" .
                        "\nPath : {$eventData->AccessControllerEvent->employeeNoString}";

                    telegramlog($caption);
                }


                $accessEventData = $eventData->AccessControllerEvent;
                $eventTime = Carbon::parse($eventData->dateTime);

                $checkWorker = Worker::with([])
                    ->where('employeeNoString', '=', $accessEventData->employeeNoString)
                    ->where('status', '=', 1)
                    ->whereHas('branch', function ($query) use ($eventData) {
                        $query->whereHas('firm', function ($query) use ($eventData) {
                            $query->where('status', '=', 1)
                                ->where('valid_date', '>=', date('Y-m-d'));
                        })
                            ->whereHas('branch_devices', function ($query) use ($eventData) {
                                $query->where('mac_address', '=', $eventData->macAddress)
                                    ->where('status', '=', 1);
                            });
                    })->first();

                if ($checkWorker) {

                    // Check for an open attendance session
                    $openAttendance = Attendance::where('worker_id', $checkWorker->id)
                        ->whereNull('to_datetime')
                        ->latest('from_datetime')
                        ->first();

                    $lastStatus = $openAttendance ? $openAttendance->type : null;
                    if ($openAttendance && $openAttendance->type === 'work') {
                        $lastStatus = 'checkIn';
                    } elseif ($openAttendance && $openAttendance->type === 'break') {
                        $lastStatus = 'breakIn';
                    }

                    $status = $accessEventData->attendanceStatus;

                    // checkIn: ALWAYS allow. AttendanceService will auto-close any orphaned sessions.
                    // No need to block here — the service handles all cleanup.

                    switch ($status) {
                        case 'checkIn':
                            // Always allowed. AttendanceService->handleCheckIn() 
                            // will auto-close any old open sessions.
                            break;

                        case 'checkOut':
                            if ($openAttendance && ($lastStatus === 'checkIn' || $lastStatus === 'breakIn' || $lastStatus === 'breakOut')) {
                                // checkOut allowed
                            } else {
                                throw new \Exception('Kelganingiz qayd etilmagan.');
                            }
                            break;

                        case 'breakIn':
                            if ($openAttendance && $lastStatus === 'breakIn') {
                                throw new \Exception('Siz allaqachon tanaffusdasiz.');
                            }
                            break;

                        case 'breakOut':
                            if ($openAttendance && $lastStatus === 'breakIn') {
                                // breakOut allowed
                            } else {
                                throw new \Exception('Tanaffusda emassiz.');
                            }
                            break;
                    }


                    // 1. Save HikvisionAccess
                    $hikvisionAccess = HikvisionAccess::create([
                        'ipAddress' => $eventData->ipAddress ?? null,
                        'portNo' => $eventData->portNo ?? null,
                        'protocol' => $eventData->protocol ?? null,
                        'macAddress' => $eventData->macAddress ?? null,
                        'channelId' => $eventData->channelID ?? null,
//                        'dateTime' => date('Y-m-d H:i:s'),
                        'dateTime' => isset($eventData->dateTime)
                            ? Carbon::parse($eventData->dateTime)->timezone('Asia/Tashkent')->format('Y-m-d H:i:s')
                            : null,
                        'activePostCount' => $eventData->activePostCount ?? null,
                        'eventType' => $eventData->eventType ?? null,
                        'eventState' => $eventData->eventState ?? null,
                        'eventDescription' => $eventData->eventDescription ?? null,
                        'shortSerialNumber' => $eventData->shortSerialNumber ?? null,
                    ]);

                    // 2. Save HikvisionAccessEvent
                    $hikvisionAccessEvent = $hikvisionAccess->hikvisionAccessEvent()->create([
                        'deviceName' => $accessEventData->deviceName ?? null,
                        'majorEventType' => $accessEventData->majorEventType ?? null,
                        'subEventType' => $accessEventData->subEventType ?? null,
                        'name' => $accessEventData->name ?? null,
                        'cardReaderNo' => $accessEventData->cardReaderNo ?? null,
                        'employeeNoString' => $accessEventData->employeeNoString ?? null,
                        'serialNo' => $accessEventData->serialNo ?? null,
                        'userType' => $accessEventData->userType ?? null,
                        'currentVerifyMode' => $accessEventData->currentVerifyMode ?? null,
                        'frontSerialNo' => $accessEventData->frontSerialNo ?? null,
                        'attendanceStatus' => $accessEventData->attendanceStatus ?? null,
                        'label' => $accessEventData->label ?? null,
                        'mask' => $accessEventData->mask ?? null,
                        'picturesNumber' => $accessEventData->picturesNumber ?? null,
                        'purePwdVerifyEnable' => $accessEventData->purePwdVerifyEnable ?? null,
                        'picture' => $filename,
                        'work_time' => $checkWorker->work_time,
                        'end_time' => $checkWorker->end_time,
                    ]);

                    // 3. Save FaceRect
                    if (isset($accessEventData->FaceRect)) {
                        $hikvisionAccessEvent->faceReact()->create([
                            'height' => $accessEventData->FaceRect->height ?? null,
                            'width' => $accessEventData->FaceRect->width ?? null,
                            'x' => $accessEventData->FaceRect->x ?? null,
                            'y' => $accessEventData->FaceRect->y ?? null,
                        ]);
                    }

                    // 4. Update Attendances table
                    $status = $accessEventData->attendanceStatus;
                    $attendanceService = app(\App\Services\AttendanceService::class);
                    try {
                        if (in_array($status, ['keldi', 'CheckIn', 'entered', 'checkIn'])) {
                            $attendanceService->handleCheckIn($checkWorker, $hikvisionAccessEvent);
                        } elseif (in_array($status, ['ketdi', 'CheckOut', 'exited', 'checkOut'])) {
                            $attendanceService->handleCheckOut($checkWorker, $hikvisionAccessEvent);
                        } elseif (in_array($status, ['Obetga ketdi', 'BreakOut', 'breakOut'])) {
                            $attendanceService->handleBreakOut($checkWorker, $hikvisionAccessEvent);
                        } elseif (in_array($status, ['Obetdan keldi', 'BreakIn', 'breakIn'])) {
                            $attendanceService->handleBreakIn($checkWorker, $hikvisionAccessEvent);
                        }
                    } catch (\Exception $e) {
                        telegramlog('Attendance xatolik: ' . $e->getMessage() . ' Line: ' . $e->getLine());
                    }

                    $webhookUrl = optional($checkWorker->branch->firm->firm_setting)->webhook_url;

                    if ($webhookUrl) {
                        try {
                            Http::timeout(5)->post($webhookUrl, $request->all());
                        } catch (\Exception $e) {
                            telegramlog('Xatolik webhookUrl: ' . $e->getMessage() . $e->getLine());
                        }
                    }

                } else {
                    telegramlog('Worker topilmadi');

                    return response()->json(['success' => false]);
                }

            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            telegramlog('Xatolik: ' . $e->getMessage() . ' | Line: ' . $e->getLine());
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(FaceRect $faceRect)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FaceRect $faceRect)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFaceRectRequest $request, FaceRect $faceRect)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FaceRect $faceRect)
    {
        //
    }
}

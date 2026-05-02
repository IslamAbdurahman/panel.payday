<?php

namespace App\Http\Controllers\Hikvision;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFaceRectRequest;
use App\Http\Requests\UpdateFaceRectRequest;
use App\Models\Branch\Branch;
use App\Models\Firm\Firm;
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
            // 1. Kelgan stringni array ko'rinishida decode qilamiz
            $eventData = json_decode($request->input('AccessControllerEvent'), true);

            // Agar asosiy JSON decode bo'lmasa yoki ichki ma'lumotlar yo'q bo'lsa
            if (!$eventData || !isset($eventData['AccessControllerEvent'])) {
                telegramlog('Xato: AccessControllerEvent decode bo‘lmadi yoki bo‘sh.');
                return response()->json(['success' => false, 'message' => 'Invalid data format'], 400);
            }

            // Ba'zida ichki AccessControllerEvent ham string bo'lib keladi, uni ham decode qilamiz
            $accessEventData = $eventData['AccessControllerEvent'];
            if (is_string($accessEventData)) {
                $accessEventData = json_decode($accessEventData, true);
            }

            $attendanceStatus = $accessEventData['attendanceStatus'] ?? null;

            if ($attendanceStatus) {
                // Kelgan requestni telegramga log qilish
                telegramlog('Hikvision Event qabul qilindi.');
                telegramlog(json_encode($request->all(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                $filename = null;
                $savedPath = 'Rasm yuklanmadi';

                // 2. Rasmni saqlash
                if ($request->hasFile('Picture')) {
                    $picture = $request->file('Picture');
                    $serialNumber = $eventData['shortSerialNumber'] ?? 'unknown';

                    $filename = time() . '_' . rand(10, 99) . '_' . $picture->getClientOriginalName();
                    $savedPath = $picture->storeAs("hikvision/{$serialNumber}", $filename, 'public');

                    $caption = "Foydalanuvchi: " . ($accessEventData['name'] ?? 'Noma\'lum') .
                        "\nHolati: " . $attendanceStatus .
                        "\nPath : " . $savedPath .
                        "\nID   : " . ($accessEventData['employeeNoString'] ?? 'Noma\'lum');

                    telegramlog($caption);
                }

                $employeeNoString = $accessEventData['employeeNoString'] ?? null;

                // 3. Xodimni va uning ruxsatlarini tekshirish
                $checkWorker = Worker::where('employeeNoString', $employeeNoString)
                    ->where('status', 1)
                    ->whereHas('branch', function ($query) use ($eventData) {
                        $query->whereHas('branch_devices', function ($q) use ($eventData) {
                            $q->where('mac_address', $eventData['macAddress'] ?? '')
                                ->where('status', 1);
                        })->whereHas('firm', function ($q) {
                            $q->where('status', 1)
                                ->where('valid_date', '>=', now()->toDateString());
                        });
                    })->first();

                if ($checkWorker) {

                    // 4. Oxirgi holatni olish (Status tekshiruvi uchun)
                    $lastHikvisionAccessEvent = HikvisionAccessEvent::where('employeeNoString', $employeeNoString)
                        ->whereHas('hikvisionAccess', function ($query) use ($eventData) {
                            $eventTime = isset($eventData['dateTime']) ? Carbon::parse($eventData['dateTime']) : now();
                            $query->where('dateTime', '>=', $eventTime->copy()->subHours(24))
                                ->where('dateTime', '<=', $eventTime);
                        })
                        ->latest()
                        ->first();

                    $lastStatus = $lastHikvisionAccessEvent ? $lastHikvisionAccessEvent->attendanceStatus : null;

                    // Switch case orqali ketma-ketlikni tekshirish
                    switch ($attendanceStatus) {
                        case 'checkIn':
                            if (!is_null($lastStatus) && $lastStatus !== 'checkOut') {
                                throw new \Exception('Siz allaqachon kelgansiz (CheckIn qilgansiz).');
                            }
                            break;

                        case 'checkOut':
                            if ($lastStatus !== 'checkIn' && $lastStatus !== 'breakIn') {
                                throw new \Exception('Siz hali kelmagansiz yoki abetdasiz.');
                            }
                            break;

                        case 'breakIn':
                            if ($lastStatus !== 'breakOut') {
                                throw new \Exception('Siz abetga chiqmagansiz.');
                            }
                            break;

                        case 'breakOut':
                            if ($lastStatus !== 'breakIn' && $lastStatus !== 'checkIn') {
                                throw new \Exception('Siz hozir abetga chiqa olmaysiz.');
                            }
                            break;

                        default:
                            throw new \Exception('Noma\'lum attendance holati: ' . $attendanceStatus);
                    }

                    // 5. HikvisionAccess bazaga saqlash
                    $hikvisionAccess = HikvisionAccess::create([
                        'ipAddress' => $eventData['ipAddress'] ?? null,
                        'portNo' => $eventData['portNo'] ?? null,
                        'protocol' => $eventData['protocol'] ?? null,
                        'macAddress' => $eventData['macAddress'] ?? null,
                        'channelId' => $eventData['channelID'] ?? null,
                        'dateTime' => isset($eventData['dateTime'])
                            ? Carbon::parse($eventData['dateTime'])->timezone('Asia/Tashkent')->format('Y-m-d H:i:s')
                            : now()->timezone('Asia/Tashkent')->format('Y-m-d H:i:s'),
                        'activePostCount' => $eventData['activePostCount'] ?? null,
                        'eventType' => $eventData['eventType'] ?? null,
                        'eventState' => $eventData['eventState'] ?? null,
                        'eventDescription' => $eventData['eventDescription'] ?? null,
                        'shortSerialNumber' => $eventData['shortSerialNumber'] ?? null,
                    ]);

                    // 6. HikvisionAccessEvent bazaga saqlash
                    $hikvisionAccessEvent = $hikvisionAccess->hikvisionAccessEvent()->create([
                        'deviceName' => $accessEventData['deviceName'] ?? null,
                        'majorEventType' => $accessEventData['majorEventType'] ?? null,
                        'subEventType' => $accessEventData['subEventType'] ?? null,
                        'name' => $accessEventData['name'] ?? null,
                        'cardReaderNo' => $accessEventData['cardReaderNo'] ?? null,
                        'employeeNoString' => $accessEventData['employeeNoString'] ?? null,
                        'serialNo' => $accessEventData['serialNo'] ?? null,
                        'userType' => $accessEventData['userType'] ?? null,
                        'currentVerifyMode' => $accessEventData['currentVerifyMode'] ?? null,
                        'frontSerialNo' => $accessEventData['frontSerialNo'] ?? null,
                        'attendanceStatus' => $attendanceStatus,
                        'label' => $accessEventData['label'] ?? null,
                        'mask' => $accessEventData['mask'] ?? null,
                        'picturesNumber' => $accessEventData['picturesNumber'] ?? null,
                        'purePwdVerifyEnable' => $accessEventData['purePwdVerifyEnable'] ?? null,
                        'picture' => $filename,
                        'work_time' => $checkWorker->work_time,
                        'end_time' => $checkWorker->end_time,
                    ]);

                    // 7. FaceRect saqlash
                    if (isset($accessEventData['FaceRect'])) {
                        $face = $accessEventData['FaceRect'];
                        // Agar FaceRect ham obyekt bo'lib kelsa arrayga o'tkazamiz
                        $face = is_array($face) ? $face : (array)$face;

                        $hikvisionAccessEvent->faceReact()->create([
                            'height' => $face['height'] ?? null,
                            'width' => $face['width'] ?? null,
                            'x' => $face['x'] ?? null,
                            'y' => $face['y'] ?? null,
                        ]);
                    }

                    // 8. AttendanceService orqali hisoblash
                    $attendanceService = app(\App\Services\AttendanceService::class);
                    try {
                        if (in_array($attendanceStatus, ['keldi', 'CheckIn', 'entered', 'checkIn'])) {
                            $attendanceService->handleCheckIn($checkWorker, $hikvisionAccessEvent);
                        } elseif (in_array($attendanceStatus, ['ketdi', 'CheckOut', 'exited', 'checkOut'])) {
                            $attendanceService->handleCheckOut($checkWorker, $hikvisionAccessEvent);
                        } elseif (in_array($attendanceStatus, ['Obetga ketdi', 'BreakOut', 'breakOut'])) {
                            $attendanceService->handleBreakOut($checkWorker, $hikvisionAccessEvent);
                        } elseif (in_array($attendanceStatus, ['Obetdan keldi', 'BreakIn', 'breakIn'])) {
                            $attendanceService->handleBreakIn($checkWorker, $hikvisionAccessEvent);
                        }
                    } catch (\Exception $e) {
                        telegramlog('Attendance xatolik: ' . $e->getMessage() . ' Line: ' . $e->getLine());
                    }

                    // 9. Webhook jo'natish
                    $webhookUrl = optional($checkWorker->branch->firm->firm_setting)->webhook_url;
                    if ($webhookUrl) {
                        try {
                            Http::timeout(5)->post($webhookUrl, $request->all());
                        } catch (\Exception $e) {
                            telegramlog('Xatolik webhookUrl: ' . $e->getMessage() . ' Line: ' . $e->getLine());
                        }
                    }

                    return response()->json(['success' => true, 'message' => 'Saved successfully']);
                } else {
                    telegramlog('Worker topilmadi yoki firma/qurilma faol emas. ID: ' . $employeeNoString);
                    return response()->json(['success' => false, 'message' => 'Worker not found'], 404);
                }
            }

            return response()->json(['success' => false, 'message' => 'AttendanceStatus topilmadi'], 400);

        } catch (\Exception $e) {
            telegramlog('Xatolik: ' . $e->getMessage() . ' | Line: ' . $e->getLine());
            telegramlog(json_encode($request->all(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            return response()->json(['error' => $e->getMessage()], 500);
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

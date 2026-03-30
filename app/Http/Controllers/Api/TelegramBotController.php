<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hikvision\HikvisionAccessEvent;
use App\Models\Worker\Worker;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TelegramBotController extends Controller
{
    /**
     * Auth via Telegram Web App initData
     */
    public function authenticate(Request $request)
    {
        try {
            $telegram_id = $request->input('telegram_id');
            $worker = Worker::query()->where('telegram_id', $telegram_id)->first();

            if (!$worker) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sizning Telegram profilingiz xodimlar ro\'yxatidan topilmadi. Iltimos, adminstratorga murojaat qiling.'
                ], 404);
            }

            // Return worker details and their current status for today
            $todayStr = Carbon::now()->toDateString();
            
            $todayCheckIn = HikvisionAccessEvent::query()->where('employeeNoString', $worker->employeeNoString)
                ->whereDate('created_at', $todayStr)
                ->where('attendanceStatus', 'checkIn')
                ->first();
                
            $todayCheckOut = HikvisionAccessEvent::query()->where('employeeNoString', $worker->employeeNoString)
                ->whereDate('created_at', $todayStr)
                ->where('attendanceStatus', 'checkOut')
                ->first();

            return response()->json([
                'success' => true,
                'worker' => $worker,
                'status' => [
                    'has_checked_in' => !!$todayCheckIn,
                    'has_checked_out' => !!$todayCheckOut,
                    'check_in_time' => $todayCheckIn ? $todayCheckIn->created_at->format('H:i') : null,
                    'check_out_time' => $todayCheckOut ? $todayCheckOut->created_at->format('H:i') : null,
                ]
            ]);
        } catch (\Exception $e) {
            if (function_exists('telegramlog')) {
                telegramlog("Auth xatosi: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
            }
            return response()->json([
                'success' => false,
                'message' => 'Xatolik: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Record Attendance (Check-in / Check-out)
     */
    public function recordAttendance(Request $request)
    {
        try {
            $request->validate([
                'telegram_id' => 'required|numeric',
                'type' => 'required|in:checkIn,checkOut',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'picture' => 'required|image|max:5120', // Max 5MB
            ]);

            $telegram_id = $request->input('telegram_id');
            $type = $request->input('type');

            $worker = Worker::query()->where('telegram_id', $telegram_id)->first();

            if (!$worker) {
                return response()->json(['success' => false, 'message' => 'Xodim topilmadi'], 404);
            }

            // Location validation (Mandatory)
            $lat1 = $request->input('latitude');
            $lon1 = $request->input('longitude');

            if (!$lat1 || !$lon1) {
                return response()->json(['success' => false, 'message' => 'Joylashuv ma\'lumoti (GPS) topilmadi. Iltimos Joylashuvga ruxsat bering.'], 400);
            }

            if (!$worker->branch || !$worker->branch->latitude || !$worker->branch->longitude) {
                return response()->json(['success' => false, 'message' => 'Siz biriktirilgan filialda GPS koordinatalar kiritilmagan. Iltimos adminstratorga murojaat qiling.'], 400);
            }

            $lat2 = $worker->branch->latitude;
            $lon2 = $worker->branch->longitude;

            $earthRadius = 6371000; // in meters
            $dLat = deg2rad($lat2 - $lat1);
            $dLon = deg2rad($lon2 - $lon1);

            $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
            $c = 2 * atan2(sqrt($a), sqrt(1-$a));

            $distance = $earthRadius * $c;

            if ($distance > 50) {
                return response()->json([
                    'success' => false,
                    'message' => 'Siz filialdan uzoqdasiz xozirgi masofa: ' . round($distance) . ' metr. Davomat olish uchun filialga kamida 50 metr yaqinlashing.'
                ], 400);
            }

            $todayStr = Carbon::now()->toDateString();

            // Check if already checked in/out today
            $exists = \App\Models\Hikvision\HikvisionAccessEvent::query()->where('employeeNoString', $worker->employeeNoString)
                ->whereDate('created_at', $todayStr)
                ->where('attendanceStatus', $type)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => $type === 'checkIn' ? 'Siz bugun ishga kelganingizni belgilagansiz' : 'Siz bugun ishdan ketganingizni belgilagansiz',
                ], 400);
            }

            // Provide a dummy HikvisionAccess to resolve foreign key constraints
            $dummyAccess = \App\Models\Hikvision\HikvisionAccess::firstOrCreate(
                ['ipAddress' => '127.0.0.1', 'protocol' => 'TelegramBot'],
                [
                    'portNo' => 80,
                    'macAddress' => '00:00:00:00:00:00',
                    'channelId' => 1,
                    'dateTime' => now(),
                    'activePostCount' => 1,
                    'eventType' => 'telegram',
                    'eventState' => 'active',
                    'eventDescription' => 'Telegram Mini App',
                    'shortSerialNumber' => 'TELEGRAM'
                ]
            );

            // Handle Picture Upload
            $picturePath = null;
            if ($request->hasFile('picture')) {
                $picturePath = $request->file('picture')->store('telegram', 'public');
            }

            // Create Access Event
            $event = \App\Models\Hikvision\HikvisionAccessEvent::create([
                'hikvision_access_id' => $dummyAccess->id,
                'deviceName' => 'Telegram_Mini_App',
                'majorEventType' => 5, // Typical access event
                'subEventType' => 75, // Typical access event
                'name' => $worker->name,
                'cardReaderNo' => 1,
                'employeeNoString' => $worker->employeeNoString,
                'serialNo' => 'TEL_' . $worker->id . '_' . time(),
                'userType' => 'normal',
                'currentVerifyMode' => 'face',
                'frontSerialNo' => null,
                'attendanceStatus' => $type,
                'label' => $type === 'checkIn' ? 'Telegramdan Keldi' : 'Telegramdan Ketdi',
                'mask' => 'unknown',
                'picturesNumber' => $picturePath ? 1 : 0,
                'purePwdVerifyEnable' => false,
                'picture' => $picturePath,
                'work_time' => $type === 'checkIn' ? Carbon::now()->format('H:i:s') : null,
                'end_time' => $type === 'checkOut' ? Carbon::now()->format('H:i:s') : null,
            ]);

            Log::info("Telegramdan davomat olindi: {$worker->name} - {$type}");

            return response()->json([
                'success' => true,
                'message' => $type === 'checkIn' ? 'Hurmatli xodim, davomat qabul qilindi (Keldi).' : 'Hurmatli xodim, davomat qabul qilindi (Ketdi).',
                'time' => $event->created_at->format('H:i')
            ]);
        } catch (\Exception $e) {
            $errorMsg = "Davomat olishda xatolik: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine();
            Log::error($errorMsg);
            
            if (function_exists('telegramlog')) {
                telegramlog($errorMsg);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Noma\'lum xatolik yuz berdi. Xabar adminlarga jo\'natildi. Error: ' . $e->getMessage()
            ], 500);
        }
    }
}

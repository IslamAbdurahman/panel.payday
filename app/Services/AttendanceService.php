<?php

namespace App\Services;

use App\Models\Attendance\Attendance;
use App\Models\Hikvision\HikvisionAccessEvent;
use App\Models\Worker\Worker;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * Handle a checkIn event
     */
    public function handleCheckIn(Worker $worker, HikvisionAccessEvent $event): Attendance
    {
        $eventTime = $event->hikvisionAccess ? Carbon::parse($event->hikvisionAccess->dateTime) : Carbon::parse($event->created_at);
        $isNightShift = $this->isNightShift($worker);

        // Auto-close any orphaned open sessions using Eloquent ORM
        $orphaned = Attendance::where('worker_id', $worker->id)
            ->whereNull('to_datetime')
            ->get();

        if ($orphaned->isNotEmpty()) {
            $ids = $orphaned->pluck('id')->toArray();
            telegramlog("Orphaned IDs: " . json_encode($ids) . " for worker {$worker->id}");

            foreach ($orphaned as $attendance) {
                $attendance->to_datetime = $attendance->from_datetime;
                $attendance->worked_minutes = 0;
                $attendance->comment = 'Avtomatik yopildi (Checkout unutilgan)';
                $attendance->save();
            }
            telegramlog("Auto-closed " . $orphaned->count() . " orphaned sessions for worker {$worker->id}");
        }

        // Determine the logical work_date
        // For night shift, if checkIn happens early morning (e.g., 01:00 AM), it might be for yesterday's shift if they are extremely late, 
        // but typically checkIn is today.
        $workDate = $eventTime->toDateString();

        // Check if this is the first checkIn for this work_date
        $isFirstCheckIn = !Attendance::where('worker_id', $worker->id)
            ->where('work_date', $workDate)
            ->where('type', 'work')
            ->exists();

        // Calculate late minutes if it is the first check-in
        $lateMinutes = 0;
        if ($isFirstCheckIn && $worker->work_time) {
            $expectedWorkTime = Carbon::parse($workDate . ' ' . $worker->work_time);
            
            // For night shift, if check in is next day morning, it would be extremely late, but check in for night shift usually happens before midnight
            if ($eventTime->gt($expectedWorkTime)) {
                $lateMinutes = $expectedWorkTime->diffInMinutes($eventTime);
            }
        }

        return Attendance::create([
            'worker_id' => $worker->id,
            'branch_id' => $worker->branch_id,
            'type' => 'work',
            'from_datetime' => $eventTime,
            'to_datetime' => null,
            'work_date' => $workDate,
            'work_time' => $worker->work_time,
            'end_time' => $worker->end_time,
            'is_night_shift' => $isNightShift,
            'late_minutes' => $lateMinutes,
            'is_first_check_in' => $isFirstCheckIn,
            'from_event_id' => $event->id,
        ]);
    }

    /**
     * Handle a checkOut event
     */
    public function handleCheckOut(Worker $worker, HikvisionAccessEvent $event): ?Attendance
    {
        $eventTime = $event->hikvisionAccess ? Carbon::parse($event->hikvisionAccess->dateTime) : Carbon::parse($event->created_at);
        $isNightShift = $this->isNightShift($worker);

        // Find the last open 'work' attendance
        // For night shifts, checkOut can happen the next day, so we search up to 48 hours back
        $query = Attendance::where('worker_id', $worker->id)
            ->where('type', 'work')
            ->whereNull('to_datetime');

        if ($isNightShift) {
            $query->where('from_datetime', '>=', $eventTime->copy()->subHours(48));
        } else {
            // For day shift, check out should typically be on the same logical work date
            $query->where('work_date', $eventTime->toDateString());
        }

        $attendance = $query->latest('from_datetime')->first();

        if ($attendance) {
            $attendance->to_datetime = $eventTime;
            $attendance->to_event_id = $event->id;
            $attendance->worked_minutes = $attendance->from_datetime->diffInMinutes($eventTime);
            $attendance->save();

            return $attendance;
        }

        return null; // Could not find matching checkIn
    }

    /**
     * Handle a breakOut event
     */
    public function handleBreakOut(Worker $worker, HikvisionAccessEvent $event): Attendance
    {
        $eventTime = $event->hikvisionAccess ? Carbon::parse($event->hikvisionAccess->dateTime) : Carbon::parse($event->created_at);
        $isNightShift = $this->isNightShift($worker);

        // Auto-close any other orphaned open 'break' sessions
        Attendance::where('worker_id', $worker->id)
            ->where('type', 'break')
            ->whereNull('to_datetime')
            ->get()
            ->each(function ($attendance) {
                $attendance->update([
                    'to_datetime' => $attendance->from_datetime,
                    'break_minutes' => 0,
                    'comment' => 'Avtomatik yopildi (BreakIn unutilgan)'
                ]);
            });
        
        // Logical work date is typically today, or yesterday if it's a night shift and past midnight
        $workDate = $eventTime->toDateString();
        // If night shift and it's morning (before 12:00), the logical work date is yesterday
        if ($isNightShift && $eventTime->hour < 12) {
            $workDate = $eventTime->copy()->subDay()->toDateString();
        }

        return Attendance::create([
            'worker_id' => $worker->id,
            'branch_id' => $worker->branch_id,
            'type' => 'break',
            'from_datetime' => $eventTime,
            'to_datetime' => null,
            'work_date' => $workDate,
            'work_time' => $worker->work_time,
            'end_time' => $worker->end_time,
            'is_night_shift' => $isNightShift,
            'from_event_id' => $event->id,
        ]);
    }

    /**
     * Handle a breakIn event
     */
    public function handleBreakIn(Worker $worker, HikvisionAccessEvent $event): ?Attendance
    {
        $eventTime = $event->hikvisionAccess ? Carbon::parse($event->hikvisionAccess->dateTime) : Carbon::parse($event->created_at);
        $isNightShift = $this->isNightShift($worker);

        $query = Attendance::where('worker_id', $worker->id)
            ->where('type', 'break')
            ->whereNull('to_datetime');

        if ($isNightShift) {
            $query->where('from_datetime', '>=', $eventTime->copy()->subHours(48));
        } else {
            // Logical work date for day shift
            $query->where('work_date', $eventTime->toDateString());
        }

        $attendance = $query->latest('from_datetime')->first();

        if ($attendance) {
            $attendance->to_datetime = $eventTime;
            $attendance->to_event_id = $event->id;
            $attendance->break_minutes = $attendance->from_datetime->diffInMinutes($eventTime);
            $attendance->save();

            return $attendance;
        }

        return null;
    }

    /**
     * Check if the worker is on a night shift
     * True if end_time < work_time (e.g. 16:00 to 08:00)
     */
    private function isNightShift(Worker $worker): bool
    {
        if (!$worker->work_time || !$worker->end_time) {
            return false;
        }
        
        return $worker->end_time < $worker->work_time;
    }
}

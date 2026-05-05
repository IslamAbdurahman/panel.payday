<?php

namespace App\Models\Attendance;

use App\Models\Branch\Branch;
use App\Models\Hikvision\HikvisionAccessEvent;
use App\Models\Worker\Worker;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'worker_id', 'branch_id', 'type',
        'from_datetime', 'to_datetime', 'work_date',
        'work_time', 'end_time', 'is_night_shift',
        'worked_minutes', 'break_minutes', 'late_minutes',
        'is_first_check_in', 'from_event_id', 'to_event_id',
        'comment',
    ];

    protected $casts = [
        'from_datetime' => 'datetime',
        'to_datetime' => 'datetime',
        'is_night_shift' => 'boolean',
        'is_first_check_in' => 'boolean',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function fromEvent()
    {
        return $this->belongsTo(HikvisionAccessEvent::class, 'from_event_id');
    }

    public function toEvent()
    {
        return $this->belongsTo(HikvisionAccessEvent::class, 'to_event_id');
    }

    public function scopeWork($query)
    {
        return $query->where('type', 'work');
    }

    public function scopeBreaks($query)
    {
        return $query->where('type', 'break');
    }

    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('work_date', [$from, $to]);
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('to_datetime');
    }
}

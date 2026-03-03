<?php

namespace App\Models\Worker;

use App\Models\Day;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerDay extends Model
{
    /** @use HasFactory<\Database\Factories\WorkerDayFactory> */
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'day_id'
    ];

    public function day()
    {
        return $this->belongsTo(Day::class, 'day_id');
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class, 'worker_id');
    }

}

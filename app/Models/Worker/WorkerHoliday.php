<?php

namespace App\Models\Worker;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerHoliday extends Model
{
    /** @use HasFactory<\Database\Factories\Worker\WorkerHolidayFactory> */
    use HasFactory;


    protected $fillable = [
        'user_id',
        'worker_id',
        'from',
        'to',
        'comment'
    ];


    public function user(){
        return $this->belongsTo(User::class , 'user_id');
    }


    public function worker(){
        return $this->belongsTo(Worker::class , 'worker_id');
    }


}

<?php

namespace App\Models\Salary;

use App\Models\User\User;
use App\Models\Worker\Worker;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryPayment extends Model
{
    /** @use HasFactory<\Database\Factories\Salary\SalaryPaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'worker_id',
        'amount',
        'comment'
    ];

    protected $with = [
        'user',
        'worker'
    ];

    public function user(){
        return $this->belongsTo(User::class , 'user_id');
    }

    public function worker(){
        return $this->belongsTo(Worker::class , 'worker_id');
    }
}

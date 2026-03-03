<?php

namespace App\Models\Salary;

use App\Models\Day;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryBranchDay extends Model
{
    /** @use HasFactory<\Database\Factories\Salary\SalaryBranchDayFactory> */
    use HasFactory;

    protected $fillable = [
        'salary_id',
        'day_id'
    ];


    public function day(){
        return $this->belongsTo(Day::class , 'day_id');
    }
}

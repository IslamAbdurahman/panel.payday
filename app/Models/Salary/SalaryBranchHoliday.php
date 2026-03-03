<?php

namespace App\Models\Salary;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryBranchHoliday extends Model
{
    /** @use HasFactory<\Database\Factories\Salary\SalaryBranchHolidayFactory> */
    use HasFactory;

    protected $fillable = [
        'salary_id',
        'name',
        'date',
        'comment'
    ];


    public function salary(){
        return $this->belongsTo(Salary::class , 'salary_id');
    }
}

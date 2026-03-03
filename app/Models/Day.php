<?php

namespace App\Models;

use App\Models\Branch\BranchDay;
use App\Models\Salary\SalaryBranchDay;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Day extends Model
{
    /** @use HasFactory<\Database\Factories\DayFactory> */
    use HasFactory;


    protected $fillable = [
        'name',
        'name_ru',
        'name_en',
        'index'
    ];


    public function branch_days()
    {
        return $this->hasMany(BranchDay::class , 'day_id');
    }
    public function salary_branch_days()
    {
        return $this->hasMany(SalaryBranchDay::class , 'day_id');
    }
}

<?php

namespace App\Models\Branch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchHoliday extends Model
{
    /** @use HasFactory<\Database\Factories\Branch\BranchHolidayFactory> */
    use HasFactory;


    protected $fillable = [
        'branch_id',
        'name',
        'date',
        'comment'
    ];


    public function branch(){
        return $this->belongsTo(Branch::class , 'branch_id');
    }
}

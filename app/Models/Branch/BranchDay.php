<?php

namespace App\Models\Branch;

use App\Models\Day;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchDay extends Model
{
    /** @use HasFactory<\Database\Factories\Branch\BranchDayFactory> */
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'day_id',
    ];

    public function day(){
        return $this->belongsTo(Day::class , 'day_id');
    }
    public function branch(){
        return $this->belongsTo(Branch::class , 'branch_id');
    }
}

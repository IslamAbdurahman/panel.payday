<?php

namespace App\Models\Branch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchDevice extends Model
{
    /** @use HasFactory<\Database\Factories\Branch\BranchDeviceFactory> */
    use HasFactory;


    protected $fillable = [
        'branch_id',
        'mac_address',
    ];


    public function branch(){
        return $this->belongsTo(Branch::class , 'branch_id');
    }
}

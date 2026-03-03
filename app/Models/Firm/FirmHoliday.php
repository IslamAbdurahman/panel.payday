<?php

namespace App\Models\Firm;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FirmHoliday extends Model
{
    /** @use HasFactory<\Database\Factories\Firm\FirmHolidayFactory> */
    use HasFactory;


    protected $fillable = [
        'firm_id',
        'name',
        'date',
        'comment'
    ];

    public function firm(){
        return $this->belongsTo(Firm::class , 'firm_id');
    }
}

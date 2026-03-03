<?php

namespace App\Models\Firm;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FirmSetting extends Model
{
    /** @use HasFactory<\Database\Factories\Firm\FirmSettingFactory> */
    use HasFactory;


    protected $fillable = [
        'firm_id',
        'webhook_url'
    ];

    public function firm()
    {
        return $this->belongsTo(Firm::class , 'firm_id');
    }
}


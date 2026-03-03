<?php

namespace App\Models\Firm;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FirmPayment extends Model
{
    /** @use HasFactory<\Database\Factories\Firm\FirmPaymentFactory> */
    use HasFactory;


    protected $fillable = [
        'user_id',
        'firm_id',
        'amount',
        'datetime',
        'valid_date',
        'comment'
    ];


    public function user()
    {
        return $this->belongsTo(User::class , 'user_id');
    }


    public function firm()
    {
        return $this->belongsTo(Firm::class , 'firm_id');
    }
}

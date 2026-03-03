<?php

namespace App\Models\User;

use App\Models\Firm\Firm;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserFirm extends Model
{
    /** @use HasFactory<\Database\Factories\UserFirmFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'firm_id',
    ];

    protected $with = [
      'user',
      'firm'
    ];


    public function user(){
        return $this->belongsTo(User::class , 'user_id');
    }


    public function firm(){
        return $this->belongsTo(Firm::class , 'firm_id');
    }
}

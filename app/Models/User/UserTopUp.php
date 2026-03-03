<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserTopUp extends Model
{
    /** @use HasFactory<\Database\Factories\UserTopUpFactory> */
    use HasFactory;


    protected $fillable = [
        'user_id',
        'client_id',
        'amount',
        'transaction_id',
    ];


    public function user(){
        return $this->belongsTo(User::class , 'user_id');
    }
    public function client(){
        return $this->belongsTo(User::class , 'client_id');
    }
}

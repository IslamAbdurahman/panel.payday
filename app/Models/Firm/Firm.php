<?php

namespace App\Models\Firm;

use App\Models\Branch\Branch;
use App\Models\User\UserFirm;
use App\Models\Worker\Worker;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Firm extends Model
{
    /** @use HasFactory<\Database\Factories\Firm\FirmFactory> */
    use HasFactory;


    protected $fillable = [
        'name',
        'address',
        'comment',
        'branch_limit',
        'branch_price',
        'valid_date',
        'status',
    ];


    public function workers()
    {
        return $this->hasManyThrough(Worker::class, Branch::class);
    }

    public function firm_setting()
    {
        return $this->hasOne(FirmSetting::class, 'firm_id');
    }

    public function firm_payments()
    {
        return $this->hasMany(FirmPayment::class, 'firm_id');
    }

    public function firm_holidays()
    {
        return $this->hasMany(FirmHoliday::class, 'firm_id');
    }

    public function branches()
    {
        return $this->hasMany(Branch::class, 'firm_id');
    }

    public function user_firms()
    {
        return $this->hasMany(UserFirm::class, 'firm_id');
    }
}

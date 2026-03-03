<?php

namespace App\Models\Hikvision;

use Illuminate\Database\Eloquent\Model;

class HikvisionAccess extends Model
{
    protected $fillable = [
        'ipAddress',
        'portNo',
        'protocol',
        'macAddress',
        'channelId',
        'dateTime',
        'activePostCount',
        'eventType',
        'eventState',
        'eventDescription',
        'shortSerialNumber'
    ];


    public function hikvisionAccessEvent()
    {
        return $this->hasOne(HikvisionAccessEvent::class , 'hikvision_access_id');
    }
}

<?php

namespace App\Models\Hikvision;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaceRect extends Model
{
    /** @use HasFactory<\Database\Factories\Hikvision\FaceRectFactory> */
    use HasFactory;

    protected $fillable = [
        'hikvision_access_event_id',
        'height',
        'width',
        'x',
        'y'
    ];


    public function hikvision_access_event(){
        return $this->belongsTo(HikvisionAccessEvent::class , 'hikvision_access_event_id');
    }
}

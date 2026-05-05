<?php

namespace App\Observers;

use App\Models\Hikvision\HikvisionAccessEvent;
use App\Models\User\User;
use App\Models\Worker\Worker;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Telegram\Bot\FileUpload\InputFile;

class HikvisionAccessEventObserver
{
    public function created(HikvisionAccessEvent $hikvisionAccessEvent): void
    {
        if ($hikvisionAccessEvent->picture) {
            \App\Jobs\SendHikvisionNotification::dispatch($hikvisionAccessEvent);
        }
    }

    public function updated(HikvisionAccessEvent $hikvisionAccessEvent): void
    {
    }
    public function deleting(HikvisionAccessEvent $hikvisionAccessEvent): void
    {
    }
    public function restored(HikvisionAccessEvent $hikvisionAccessEvent): void
    {
    }
    public function forceDeleted(HikvisionAccessEvent $hikvisionAccessEvent): void
    {
    }
}
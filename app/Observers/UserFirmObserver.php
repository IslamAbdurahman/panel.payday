<?php

namespace App\Observers;

use App\Models\User\UserFirm;
use Illuminate\Support\Facades\Auth;

class UserFirmObserver
{
    /**
     * Handle the UserFirm "created" event.
     */
    public function created(UserFirm $userFirm): void
    {
        if (!Auth::user()->hasRole('Admin')) {
            throw new \Exception('You are not allowed to access this page');
        }
    }

    /**
     * Handle the UserFirm "updated" event.
     */
    public function updated(UserFirm $userFirm): void
    {
        //
    }

    /**
     * Handle the UserFirm "deleted" event.
     */
    public function deleted(UserFirm $userFirm): void
    {
        if (!Auth::user()->hasRole('Admin')) {
            throw new \Exception('You are not allowed to access this page');
        }
    }

    /**
     * Handle the UserFirm "restored" event.
     */
    public function restored(UserFirm $userFirm): void
    {
        //
    }

    /**
     * Handle the UserFirm "force deleted" event.
     */
    public function forceDeleted(UserFirm $userFirm): void
    {
        //
    }
}

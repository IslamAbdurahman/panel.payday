<?php

namespace App\Observers;

use App\Models\User\UserTopUp;

class UserTopUpObserver
{
    /**
     * Handle the UserTopUp "created" event.
     */
    public function created(UserTopUp $userTopUp): void
    {
        //
    }

    /**
     * Handle the UserTopUp "updated" event.
     */
    public function updated(UserTopUp $userTopUp): void
    {
        //
    }

    /**
     * Handle the UserTopUp "deleted" event.
     */
    public function deleted(UserTopUp $userTopUp): void
    {
        //
    }

    /**
     * Handle the UserTopUp "restored" event.
     */
    public function restored(UserTopUp $userTopUp): void
    {
        //
    }

    /**
     * Handle the UserTopUp "force deleted" event.
     */
    public function forceDeleted(UserTopUp $userTopUp): void
    {
        //
    }
}

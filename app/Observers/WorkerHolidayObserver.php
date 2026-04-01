<?php

namespace App\Observers;

use App\Models\Worker\WorkerHoliday;
use Illuminate\Support\Facades\Auth;

class WorkerHolidayObserver
{
    /**
     * Handle the WorkerHoliday "created" event.
     */
    public function creating(WorkerHoliday $workerHoliday): void
    {
        // Non-admin users must be part of the firm
        if (Auth::check() && !Auth::user()->hasRole('Admin')) {
            Auth::user()->user_firms()
                ->where('firm_id', $workerHoliday->worker->branch->firm_id)
                ->firstOrFail(); // Throws if unauthorized
        }

        if (Auth::check()) {
            $workerHoliday->user_id = Auth::user()->id;
        }
    }

    /**
     * Handle the WorkerHoliday "updated" event.
     */
    public function updated(WorkerHoliday $workerHoliday): void
    {
        //
    }

    /**
     * Handle the WorkerHoliday "deleted" event.
     */
    public function deleting(WorkerHoliday $workerHoliday): void
    {
        // Non-admin users must be part of the firm
        if (Auth::check() && !Auth::user()->hasRole('Admin')) {
            Auth::user()->user_firms()
                ->where('firm_id', $workerHoliday->worker->branch->firm_id)
                ->firstOrFail(); // Throws if unauthorized
        }
    }

    /**
     * Handle the WorkerHoliday "restored" event.
     */
    public function restored(WorkerHoliday $workerHoliday): void
    {
        //
    }

    /**
     * Handle the WorkerHoliday "force deleted" event.
     */
    public function forceDeleted(WorkerHoliday $workerHoliday): void
    {
        //
    }
}

<?php

namespace App\Observers;

use App\Models\Firm\FirmHoliday;
use Illuminate\Support\Facades\Auth;

class FirmHolidayObserver
{
    /**
     * Handle the FirmHoliday "created" event.
     */
    public function creating(FirmHoliday $firmHoliday): void
    {
        // Non-admin users must be part of the firm
        if (Auth::check() && !Auth::user()->hasRole('Admin')) {
            Auth::user()->user_firms()
                ->where('firm_id', $firmHoliday->firm_id)
                ->firstOrFail(); // Throws if unauthorized
        }
    }

    /**
     * Handle the FirmHoliday "updated" event.
     */
    public function updated(FirmHoliday $firmHoliday): void
    {
        //
    }

    /**
     * Handle the FirmHoliday "deleted" event.
     */
    public function deleting(FirmHoliday $firmHoliday): void
    {
        if (Auth::check() && !Auth::user()->hasRole('Admin')) {
            $firmHoliday->whereHas('firm', function ($query) {
                $query->whereHas('user_firms', function ($query) {
                    $query->where('user_id', Auth::id());
                });
            })->firstOrFail();
        }
    }

    /**
     * Handle the FirmHoliday "restored" event.
     */
    public function restored(FirmHoliday $firmHoliday): void
    {
        //
    }

    /**
     * Handle the FirmHoliday "force deleted" event.
     */
    public function forceDeleted(FirmHoliday $firmHoliday): void
    {
        //
    }
}

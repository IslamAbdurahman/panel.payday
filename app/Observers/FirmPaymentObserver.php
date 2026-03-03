<?php

namespace App\Observers;

use App\Models\Firm\FirmPayment;

class FirmPaymentObserver
{
    /**
     * Handle the FirmPayment "created" event.
     */
    public function created(FirmPayment $firmPayment): void
    {
        //
    }

    /**
     * Handle the FirmPayment "updated" event.
     */
    public function updated(FirmPayment $firmPayment): void
    {
        //
    }

    /**
     * Handle the FirmPayment "deleted" event.
     */
    public function deleted(FirmPayment $firmPayment): void
    {
        //
    }

    /**
     * Handle the FirmPayment "restored" event.
     */
    public function restored(FirmPayment $firmPayment): void
    {
        //
    }

    /**
     * Handle the FirmPayment "force deleted" event.
     */
    public function forceDeleted(FirmPayment $firmPayment): void
    {
        //
    }
}

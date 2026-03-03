<?php

namespace App\Observers;

use App\Models\Salary\SalaryFirmHoliday;

class SalaryFirmHolidayObserver
{
    /**
     * Handle the SalaryFirmHoliday "created" event.
     */
    public function created(SalaryFirmHoliday $salaryFirmHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryFirmHoliday "updated" event.
     */
    public function updated(SalaryFirmHoliday $salaryFirmHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryFirmHoliday "deleted" event.
     */
    public function deleted(SalaryFirmHoliday $salaryFirmHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryFirmHoliday "restored" event.
     */
    public function restored(SalaryFirmHoliday $salaryFirmHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryFirmHoliday "force deleted" event.
     */
    public function forceDeleted(SalaryFirmHoliday $salaryFirmHoliday): void
    {
        //
    }
}

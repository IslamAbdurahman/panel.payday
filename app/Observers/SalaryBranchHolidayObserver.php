<?php

namespace App\Observers;

use App\Models\Salary\SalaryBranchHoliday;

class SalaryBranchHolidayObserver
{
    /**
     * Handle the SalaryBranchHoliday "created" event.
     */
    public function created(SalaryBranchHoliday $salaryBranchHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryBranchHoliday "updated" event.
     */
    public function updated(SalaryBranchHoliday $salaryBranchHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryBranchHoliday "deleted" event.
     */
    public function deleted(SalaryBranchHoliday $salaryBranchHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryBranchHoliday "restored" event.
     */
    public function restored(SalaryBranchHoliday $salaryBranchHoliday): void
    {
        //
    }

    /**
     * Handle the SalaryBranchHoliday "force deleted" event.
     */
    public function forceDeleted(SalaryBranchHoliday $salaryBranchHoliday): void
    {
        //
    }
}

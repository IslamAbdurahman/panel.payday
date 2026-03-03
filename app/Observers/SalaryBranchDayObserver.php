<?php

namespace App\Observers;

use App\Models\Salary\SalaryBranchDay;

class SalaryBranchDayObserver
{
    /**
     * Handle the SalaryBranchDay "created" event.
     */
    public function created(SalaryBranchDay $salaryBranchDay): void
    {
        //
    }

    /**
     * Handle the SalaryBranchDay "updated" event.
     */
    public function updated(SalaryBranchDay $salaryBranchDay): void
    {
        //
    }

    /**
     * Handle the SalaryBranchDay "deleted" event.
     */
    public function deleted(SalaryBranchDay $salaryBranchDay): void
    {
        //
    }

    /**
     * Handle the SalaryBranchDay "restored" event.
     */
    public function restored(SalaryBranchDay $salaryBranchDay): void
    {
        //
    }

    /**
     * Handle the SalaryBranchDay "force deleted" event.
     */
    public function forceDeleted(SalaryBranchDay $salaryBranchDay): void
    {
        //
    }
}

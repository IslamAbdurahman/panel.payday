<?php

namespace App\Http\Controllers\Branch;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBranchHolidayRequest;
use App\Http\Requests\UpdateBranchHolidayRequest;
use App\Models\Branch\BranchHoliday;
use Illuminate\Validation\ValidationException;

class BranchHolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBranchHolidayRequest $request)
    {
        try {
            BranchHoliday::create($request->validated());

            return back()->with('success', 'BranchHoliday created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(BranchHoliday $branchHoliday)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BranchHoliday $branchHoliday)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBranchHolidayRequest $request, BranchHoliday $branchHoliday)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BranchHoliday $branchHoliday)
    {
        try {
            $branchHoliday->delete();
            return back()->with('success', 'BranchHoliday deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}

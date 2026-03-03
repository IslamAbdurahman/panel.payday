<?php

namespace App\Http\Controllers\Branch;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBranchDayRequest;
use App\Http\Requests\UpdateBranchDayRequest;
use App\Models\Branch\BranchDay;
use Illuminate\Validation\ValidationException;

class BranchDayController extends Controller
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

    public function store(StoreBranchDayRequest $request)
    {
        try {
            $validated = $request->validated();

            $branch = BranchDay::where([
                'branch_id' => $validated['branch_id']
            ])
                ->whereIn('day_id', $validated['day_ids'])
                ->first();

            if ($branch) {
                throw new \Exception('Already created.');
            }

            foreach ($validated['day_ids'] as $dayId) {
                BranchDay::create([
                    'branch_id' => $validated['branch_id'],
                    'day_id' => $dayId,
                ]);
            }

            return back()->with('success', 'BranchDay created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(BranchDay $branchDay)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BranchDay $branchDay)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBranchDayRequest $request, BranchDay $branchDay)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BranchDay $branchDay)
    {
        try {
            $branchDay->delete();
            return back()->with('success', 'BranchDay deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}

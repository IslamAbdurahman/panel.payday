<?php

namespace App\Http\Controllers\Branch;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBranchDeviceRequest;
use App\Http\Requests\UpdateBranchDeviceRequest;
use App\Models\Branch\BranchDevice;
use Illuminate\Validation\ValidationException;

class BranchDeviceController extends Controller
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
    public function store(StoreBranchDeviceRequest $request)
    {
        try {
            BranchDevice::create($request->validated());

            return back()->with('success', 'BranchDevice created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(BranchDevice $branchDevice)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BranchDevice $branchDevice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBranchDeviceRequest $request, BranchDevice $branchDevice)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BranchDevice $branchDevice)
    {
        try {
            $branchDevice->delete();
            return back()->with('success', 'BranchDevice deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}

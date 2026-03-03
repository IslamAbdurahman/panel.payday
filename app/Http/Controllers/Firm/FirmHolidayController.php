<?php

namespace App\Http\Controllers\Firm;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFirmHolidayRequest;
use App\Http\Requests\UpdateFirmHolidayRequest;
use App\Models\Firm\FirmHoliday;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FirmHolidayController extends Controller
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
    public function store(StoreFirmHolidayRequest $request)
    {
        try {

            FirmHoliday::create($request->validated());

            return back()->with('success', 'FirmHoliday created successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(FirmHoliday $firmHoliday)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FirmHoliday $firmHoliday)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFirmHolidayRequest $request, FirmHoliday $firmHoliday)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FirmHoliday $firmHoliday)
    {
        try {

            if ($firmHoliday->count() == 0) {
                throw new \Exception('You are not allowed to access this page');
            }

            $firmHoliday->delete();
            return back()->with('success', 'FirmHoliday deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}

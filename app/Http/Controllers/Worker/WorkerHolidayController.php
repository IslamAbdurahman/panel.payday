<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWorkerHolidayRequest;
use App\Http\Requests\UpdateWorkerHolidayRequest;
use App\Models\Worker\WorkerHoliday;
use Illuminate\Validation\ValidationException;

class WorkerHolidayController extends Controller
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
    public function store(StoreWorkerHolidayRequest $request)
    {
        try {
            WorkerHoliday::create($request->validated());

            return back()->with('success', 'WorkerHoliday created successfully.');
        } catch (\Exception $e) {
            telegramlog($e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(WorkerHoliday $workerHoliday)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WorkerHoliday $workerHoliday)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWorkerHolidayRequest $request, WorkerHoliday $workerHoliday)
    {
        try {
            $workerHoliday->update($request->validated());
            return back()->with('success', 'WorkerHoliday updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WorkerHoliday $workerHoliday)
    {
        try {
            $workerHoliday->delete();
            return back()->with('success', 'WorkerHoliday deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}

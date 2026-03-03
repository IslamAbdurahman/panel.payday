<?php

namespace App\Http\Controllers\Firm;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFirmSettingRequest;
use App\Http\Requests\UpdateFirmSettingRequest;
use App\Models\Firm\FirmSetting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FirmSettingController extends Controller
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
    public function store(StoreFirmSettingRequest $request)
    {
        try {

            FirmSetting::updateOrCreate(
                ['firm_id' => $request->firm_id],
                ['webhook_url' => $request->webhook_url]
            );

            return back()->with('success', 'FirmSetting created successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            throw ValidationException::withMessages([
                'error' => ['You are not allowed to access this firm.'],
            ]);
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(FirmSetting $firmSetting)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FirmSetting $firmSetting)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFirmSettingRequest $request, FirmSetting $firmSetting)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FirmSetting $firmSetting)
    {
        //
    }
}

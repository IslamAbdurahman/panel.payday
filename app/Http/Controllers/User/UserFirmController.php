<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserFirmRequest;
use App\Http\Requests\UpdateUserFirmRequest;
use App\Models\User\UserFirm;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class UserFirmController extends Controller
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
    public function store(StoreUserFirmRequest $request)
    {

        if (!Auth::user()->hasRole('Admin')) {
            return back()->with('error', "You are not allowed to access this page");
        }

        try {

            UserFirm::create($request->validated());

            return back()->with('success', 'UserFirm created successfully.');
        } catch (\Exception $e) {
            telegramlog($e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(UserFirm $userFirm)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserFirm $userFirm)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserFirmRequest $request, UserFirm $userFirm)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserFirm $userFirm)
    {

        if (!Auth::user()->hasRole('Admin')) {
            return back()->with('error', "You are not allowed to access this page");
        }

        try {
            $userFirm->delete();
            return back()->with('success', 'UserFirm deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}

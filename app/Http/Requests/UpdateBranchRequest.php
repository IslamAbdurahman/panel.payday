<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required',
            'address' => 'nullable',
            'comment' => 'nullable',
            'work_time' => 'required',
            'end_time' => 'required',
            'hour_price' => 'required',
            'fine_price' => 'required|numeric|min:0',
            'status' => 'required',
            'telegram_group_id' => 'nullable|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'address.required' => 'The address field is required.',
            'end_time.required' => 'The work time field is required.',
            'end_time.required' => 'The end time field is required.',
            'hour_price.required' => 'The hour price field is required.',
            'fine_price.required' => 'The hour price field is required.',
            'status.required' => 'The status field is required.',
        ];
    }

}
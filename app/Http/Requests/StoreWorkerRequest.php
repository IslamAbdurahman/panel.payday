<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkerRequest extends FormRequest
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
            'branch_id' => 'required',
            'work_time' => 'required',
            'end_time' => 'required',
            'hour_price' => 'numeric|min:0',
            'fine_price' => 'numeric|min:0',
            'name' => 'required',
            'phone' => 'nullable|unique:workers,phone',
            'address' => 'nullable',
            'comment' => 'nullable',
            'status' => 'nullable',
            'avatar' => 'nullable|image|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'The branch field is required.',
            'work_time.required' => 'The work time field is required.',
            'end_time.required' => 'The end time field is required.',
            'name.required' => 'The name field is required.',
            'phone.unique' => 'This phone number has already been taken.',
            'phone.nullable' => 'The phone field is required.',
            'address.nullable' => 'The address field is required.',
            'comment.nullable' => 'The comment field is required.',
        ];
    }

}

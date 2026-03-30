<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkerRequest extends FormRequest
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
            'work_time' => 'required',
            'end_time' => 'required',
            'hour_price' => 'numeric|min:0',
            'fine_price' => 'numeric|min:0',
            'name' => 'required',
            'phone' => 'nullable',
            'address' => 'nullable',
            'comment' => 'nullable',
            'status' => 'nullable',
            'avatar' => 'nullable|image|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'work_time.required' => 'The work time field is required.',
            'end_time.required' => 'The end time field is required.',
        ];
    }

}

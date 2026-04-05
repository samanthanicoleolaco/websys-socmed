<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // Allow authenticated users to create pets
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0|max:50',
            'breed' => 'required|string|max:255',
            'photo' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'name.required' => 'Pet name is required.',
            'age.required' => 'Pet age is required.',
            'age.integer' => 'Age must be a number.',
            'age.min' => 'Age cannot be negative.',
            'breed.required' => 'Pet breed is required.',
            'photo.string' => 'Photo must be a valid URL or path.',
            'bio.max' => 'Bio cannot exceed 1000 characters.',
        ];
    }
}

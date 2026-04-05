<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // Allow authenticated users to create posts
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'pet_id' => 'required|exists:pets,id',
            'caption' => 'required|string|max:2000',
            'image' => 'nullable|string|max:500',
            'video' => 'nullable|string|max:500',
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
            'pet_id.required' => 'Pet ID is required.',
            'pet_id.exists' => 'Selected pet does not exist.',
            'caption.required' => 'Caption is required.',
            'caption.max' => 'Caption cannot exceed 2000 characters.',
            'image.string' => 'Image must be a valid URL or path.',
            'video.string' => 'Video must be a valid URL or path.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->pet_id && $this->user()) {
                $pet = \App\Models\Pet::find($this->pet_id);
                if ($pet && $pet->user_id !== $this->user()->id) {
                    $validator->errors()->add('pet_id', 'You can only create posts for your own pets.');
                }
            }
        });
    }
}

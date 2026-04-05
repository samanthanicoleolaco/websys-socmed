<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // Allow authenticated users to create comments
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'post_id' => 'required|exists:posts,id',
            'pet_id' => 'required|exists:pets,id',
            'content' => 'required|string|max:1000',
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
            'post_id.required' => 'Post ID is required.',
            'post_id.exists' => 'Selected post does not exist.',
            'pet_id.required' => 'Pet ID is required.',
            'pet_id.exists' => 'Selected pet does not exist.',
            'content.required' => 'Comment content is required.',
            'content.max' => 'Comment cannot exceed 1000 characters.',
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
                    $validator->errors()->add('pet_id', 'You can only comment using your own pets.');
                }
            }
        });
    }
}

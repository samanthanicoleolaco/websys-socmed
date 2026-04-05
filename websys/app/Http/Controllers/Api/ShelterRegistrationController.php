<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShelterRegistration;
use Illuminate\Http\Request;

class ShelterRegistrationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'organization_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:2000',
        ]);

        ShelterRegistration::create($validated);

        return response()->json([
            'message' => 'Thanks! Our team will email you within 2–3 business days to verify your shelter.',
        ], 201);
    }
}

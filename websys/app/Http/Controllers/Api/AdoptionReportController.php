<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdoptionReport;
use Illuminate\Http\Request;

class AdoptionReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => 'nullable|string|max:64',
            'pet_name' => 'required|string|max:255',
            'reason' => 'required|string|in:spam,misleading,inappropriate,animal_welfare,other',
            'details' => 'nullable|string|max:2000',
        ]);

        AdoptionReport::create(array_merge($validated, [
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 512),
        ]));

        return response()->json([
            'message' => 'Thank you. Our safety team will review this listing.',
        ], 201);
    }
}

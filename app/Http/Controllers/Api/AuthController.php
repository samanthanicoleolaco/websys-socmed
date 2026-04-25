<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Pet;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        $token = $user->createToken('pawtastic-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($validated)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = $request->user();
        if (!$user->hasVerifiedEmail()) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Please verify your email before logging in to Petverse.'],
            ]);
        }

        $token = $user->createToken('pawtastic-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user()->load('pet');
        return response()->json($user);
    }

    /**
     * Update user profile photo
     */
    public function updateProfilePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            // Delete old photo from user record if it exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $path = $request->file('photo')->store('profile_photos', 'public');
            
            // Save to users table
            $user->profile_photo = $path;
            $user->save();

            // Sync with the user's primary pet so it reflects on the Profile page and Feed
            if ($user->pet) {
                $user->pet->photo = $path;
                $user->pet->save();
            }

            return response()->json([
                'message' => 'Profile photo updated successfully',
                'avatar_url' => url('storage/' . $path),
            ]);
        }

        return response()->json(['message' => 'No photo uploaded'], 400);
    }

    /**
     * Update user profile details
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
        ]);

        $user->update($validated);
        
        // Handle pet details
        $petData = [
            'name' => $request->input('petName'),
            'breed' => $request->input('breed'),
            'age' => $request->input('age'),
            'bio' => $request->input('petBio'),
            'location' => $request->input('location'),
        ];

        // Clean up nulls
        $petData = array_filter($petData, function($v) { return !is_null($v); });

        if ($user->pet) {
            $user->pet->update($petData);
        } else if ($request->input('petName')) {
            // Create a pet if none exists but name is provided
            $user->pet()->create($petData);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('pet'),
        ]);
    }
}

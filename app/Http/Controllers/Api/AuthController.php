<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Pet;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

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
        $request->merge([
            'email' => trim((string) $request->input('email', '')),
        ]);

        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'remember' => 'sometimes|boolean',
        ]);

        if (!Auth::attempt(
            ['email' => $validated['email'], 'password' => $validated['password']],
            (bool) ($validated['remember'] ?? false)
        )) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();   // <-- use the web-guard user, not $request->user()

        if (!$user->hasVerifiedEmail()) {
            \App\Models\LoginAudit::create(['user_id' => $user->id, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'successful' => false, 'failure_reason' => 'unverified_email', 'login_at' => now()]);
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Please verify your email before logging in to Petverse.'],
            ]);
        }

        if (!empty($user->is_banned)) {
            \App\Models\LoginAudit::create(['user_id' => $user->id, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'successful' => false, 'failure_reason' => 'banned', 'login_at' => now()]);
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['This account has been suspended. Contact support.'],
            ]);
        }

        // Token for SPA Bearer flow + session for cookie flow (works either way).
        $user->tokens()->where('name', 'pawtastic-token')->delete();
        $token = $user->createToken('pawtastic-token')->plainTextToken;

        \App\Models\LoginAudit::create(['user_id' => $user->id, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'successful' => true, 'login_at' => now()]);

        return response()->json([
            'user'  => $user->loadMissing('pet'),
            'token' => $token,
            'redirect' => $user->is_admin ? '/admin' : '/homefeed',
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
            'username' => ['sometimes', 'nullable', 'string', 'max:32', Rule::unique('users', 'username')->ignore($user->id)],
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'notifications' => 'sometimes|array',
            'privacy' => 'sometimes|array',
            'petName' => 'sometimes|nullable|string|max:255',
            'breed' => 'sometimes|nullable|string|max:255',
            'age' => 'sometimes|nullable|integer|min:0|max:50',
            'petBio' => 'sometimes|nullable|string|max:500',
            'petGender' => 'sometimes|nullable|in:male,female,unknown,other',
            'petSpecies' => 'sometimes|nullable|string|max:64',
            'petBirthday' => 'sometimes|nullable|date',
        ]);

        $user->update($validated);

        if ($request->hasAny(['notifications', 'privacy'])) {
            $user->forceFill([
                'user_settings' => array_filter([
                    'notifications' => $request->input('notifications', $user->user_settings['notifications'] ?? null),
                    'privacy' => $request->input('privacy', $user->user_settings['privacy'] ?? null),
                ], function ($value) {
                    return !is_null($value);
                }),
            ])->save();
        }
        
        $petData = array_filter([
            'name' => $request->input('petName'),
            'breed' => $request->input('breed'),
            'age' => $request->input('age'),
            'bio' => $request->input('petBio'),
            'gender' => $request->input('petGender') === 'other' ? 'unknown' : $request->input('petGender'),
            'species' => $request->input('petSpecies'),
            'birthday' => $request->input('petBirthday'),
        ], function ($value) {
            return !is_null($value);
        });

        if ($user->pet) {
            $user->pet->update($petData);
        } else if ($request->input('petName')) {
            $user->pet()->create($petData);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('pet'),
        ]);
    }

    public function savePetInfo(Request $request)
    {
        $user = $request->user();

        $hasPet = $user->pet()->exists();
        $rules = [
            'petName' => [$hasPet ? 'sometimes' : 'required', 'string', 'max:255'],
            'username' => [$hasPet ? 'sometimes' : 'required', 'string', 'max:32', 'regex:/^[a-z0-9_]+$/i', Rule::unique('users', 'username')->ignore($user->id)],
            'age' => [$hasPet ? 'sometimes' : 'required', 'integer', 'min:0', 'max:50'],
            'gender' => [$hasPet ? 'sometimes' : 'required', 'in:male,female,unknown,other'],
            'birthday' => ['nullable', 'date'],
            'species' => [$hasPet ? 'sometimes' : 'required', 'string', 'max:64'],
            'breed' => [$hasPet ? 'sometimes' : 'required', 'string', 'max:255'],
            'is_private' => ['sometimes', 'boolean'],
        ];

        $validated = $request->validate($rules);

        if (array_key_exists('username', $validated)) {
            $user->forceFill([
                'username' => $validated['username'],
            ])->save();
        }

        $petData = [];
        if (array_key_exists('petName', $validated)) {
            $petData['name'] = $validated['petName'];
        }
        if (array_key_exists('age', $validated)) {
            $petData['age'] = $validated['age'];
        }
        if (array_key_exists('gender', $validated)) {
            $petData['gender'] = $validated['gender'] === 'other' ? 'unknown' : $validated['gender'];
        }
        if (array_key_exists('birthday', $validated)) {
            $petData['birthday'] = $validated['birthday'] ?? null;
        }
        if (array_key_exists('species', $validated)) {
            $petData['species'] = $validated['species'];
        }
        if (array_key_exists('breed', $validated)) {
            $petData['breed'] = $validated['breed'];
        }
        if (array_key_exists('is_private', $validated)) {
            $petData['is_private'] = (bool) $validated['is_private'];
        }

        if ($hasPet) {
            $pet = $user->pet;
            $pet->update($petData);
        } else {
            $pet = $user->pets()->create($petData);
        }

        return response()->json([
            'message' => 'Pet profile saved successfully',
            'user' => $user->load('pet'),
            'pet' => $pet,
        ]);
    }

    /**
     * POST /api/auth/logout-all
     * Revoke all tokens and logout.
     */
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();
        Auth::logout();

        return response()->json(['message' => 'Logged out from all devices.']);
    }

    /**
     * POST /api/user/deactivate
     * Mark account as deactivated.
     */
    public function deactivate(Request $request)
    {
        $request->user()->update(['is_deactivated' => true]);
        $request->user()->tokens()->delete();
        Auth::logout();

        return response()->json(['message' => 'Account deactivated.']);
    }

    /**
     * DELETE /api/user
     * Permanently delete the user account.
     */
    public function destroy(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        Auth::logout();
        $user->delete();

        return response()->json(['message' => 'Account permanently deleted.']);
    }
}

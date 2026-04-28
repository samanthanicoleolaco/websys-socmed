<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EmailJsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function __construct()
    {
        // Removed 'guest' middleware to prevent server-side redirect loops in SPA mode.
    }

    public function showRegistrationForm()
    {
        return view('welcome');
    }

    public function register(Request $request)
    {
        $request->merge([
            'email' => trim((string) $request->input('email', '')),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $localPart = strstr($validated['email'], '@', true) ?: 'user';

        $user = User::create([
            'name' => $localPart,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => null,
            'is_admin' => false,
        ]);

        $verificationCode = (string) random_int(100000, 999999);

        $user->forceFill([
            'email_verification_code_hash' => Hash::make($verificationCode),
            'email_verification_expires_at' => now()->addMinutes(15),
        ])->save();

        $request->session()->put([
            'pending_verification_user_id' => $user->id,
            'pending_verification_email' => $user->email,
        ]);

        try {
            app(EmailJsService::class)->sendVerificationEmail($user->name ?: $localPart, $user->email, $verificationCode);
        } catch (\Throwable $e) {
            report($e);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to send verification email. Please try again shortly.',
                ], 500);
            }

            return back()->withErrors([
                'email' => 'Unable to send verification email. Please try again shortly.',
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'redirect' => '/email/verify',
            ]);
        }

        return redirect('/email/verify');
    }
}

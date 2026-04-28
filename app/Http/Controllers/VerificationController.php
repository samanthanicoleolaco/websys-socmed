<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EmailJsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class VerificationController extends Controller
{
    public function __construct()
    {
        // Removed 'guest' middleware to prevent redirect loop for logged-in but unverified users
        $this->middleware('throttle:6,1')->only('verify', 'resend');
    }

    public function show(Request $request)
    {
        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('register')
                ->withErrors(['email' => 'Start by creating your account first.']);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect('/pet-info');
        }

        return view('welcome', [
            'pendingVerificationEmail' => $user->email,
        ]);
    }

    public function verify(Request $request)
    {
        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('register')
                ->withErrors(['email' => 'Verification session expired. Please register again.']);
        }

        $validated = $request->validate([
            'verification_code' => ['required', 'digits:6'],
        ]);

        if (!$user->email_verification_code_hash || !$user->email_verification_expires_at) {
            return back()->withErrors(['verification_code' => 'No active verification code found. Please resend it.']);
        }

        if (now()->greaterThan($user->email_verification_expires_at)) {
            return back()->withErrors(['verification_code' => 'This verification code has expired. Please resend a new code.']);
        }

        if (!Hash::check($validated['verification_code'], $user->email_verification_code_hash)) {
            return back()->withErrors(['verification_code' => 'That verification code is incorrect.']);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_verification_code_hash' => null,
            'email_verification_expires_at' => null,
        ])->save();

        $request->session()->forget(['pending_verification_user_id', 'pending_verification_email']);
        Auth::login($user);
        $request->session()->regenerate();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'redirect' => '/pet-info',
            ]);
        }

        return redirect('/pet-info');
    }

    public function resend(Request $request, EmailJsService $emailJsService)
    {
        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('register')
                ->withErrors(['email' => 'Verification session expired. Please register again.']);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect('/pet-info')->with('status', 'Your account is already verified.');
        }

        $verificationCode = (string) random_int(100000, 999999);
        $user->forceFill([
            'email_verification_code_hash' => Hash::make($verificationCode),
            'email_verification_expires_at' => now()->addMinutes(15),
        ])->save();

        try {
            $emailJsService->sendVerificationEmail($user->name, $user->email, $verificationCode);
        } catch (\Throwable $e) {
            report($e);
            return back()->withErrors([
                'verification_code' => 'Unable to resend now. Enable EmailJS non-browser API access in your EmailJS dashboard, then retry.',
            ]);
        }

        return back()->with('status', 'A new Petverse verification email is on its way.');
    }

    private function pendingUser(Request $request): ?User
    {
        $userId = $request->session()->get('pending_verification_user_id');
        if (!$userId) {
            return null;
        }

        return User::find($userId);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Login;

class LoginController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }
    /**
     * Show the application's login form.
     *
     * @return \Illuminate\View\View
     */
    public function showLoginForm()
    {
        return view('welcome');
    }

    public function login(Request $request)
    {
        $request->merge([
            'email' => trim((string) $request->input('email', '')),
        ]);

        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided credentials do not match our records.',
                ]);
            }
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->withInput($request->only('email', 'remember'));
        }

        $request->session()->regenerate();

        try {
            Login::create([
                'user_id' => Auth::id(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_at' => now(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        // Send Login Alert Email via EmailJS
        try {
            \Illuminate\Support\Facades\Http::post('https://api.emailjs.com/api/v1.0/email/send', [
                'service_id' => 'service_yi1yhq4',
                'template_id' => 'template_xee3u8a',
                'user_id' => 'xkV0CNBFLOo70K7JC',
                'accessToken' => 'MBX3J8JVbBXSPZA1EBaV1',
                'template_params' => [
                    'to_name' => Auth::user()->name ?? 'User',
                    'to_email' => Auth::user()->email,
                    'message' => 'You have successfully logged into Petverse. If this was not you, please secure your account immediately.',
                ]
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        $redirectUrl = Auth::user()->is_admin ? '/admin' : '/';

        // Always JSON if expected, otherwise redirect
        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'redirect' => $redirectUrl]);
        }

        return redirect()->intended($redirectUrl);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();
        if ($user) {
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false, 'message' => 'Email not found in our system.'], 404);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8'
        ]);
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
            $user->save();
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false, 'message' => 'Reset failed.'], 400);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller
{
    public function __construct()
    {
        $this->middleware('guest');
    }

    public function showRegistrationForm()
    {
        return view('welcome');
    }

    public function register(Request $request)
    {
        try {
            $request->merge([
                'email' => trim((string) $request->input('email', '')),
            ]);

            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_admin' => false,
            ]);

            Auth::login($user);

            try {
                \App\Models\Login::create([
                    'user_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'login_at' => now(),
                ]);
            } catch (\Throwable $e) {
                report($e);
            }

            // Send Welcome Email via EmailJS
            try {
                \Illuminate\Support\Facades\Http::post('https://api.emailjs.com/api/v1.0/email/send', [
                    'service_id' => 'service_yi1yhq4',
                    'template_id' => 'template_xee3u8a',
                    'user_id' => 'xkV0CNBFLOo70K7JC',
                    'accessToken' => 'MBX3J8JVbBXSPZA1EBaV1',
                    'template_params' => [
                        'to_name' => $user->name,
                        'to_email' => $user->email,
                        'message' => 'Welcome to Petverse! Your account has been successfully created. We are excited to see you and your pet!',
                    ]
                ]);
            } catch (\Throwable $e) {
                report($e);
            }

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'redirect' => '/']);
            }

            return redirect('/');
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => collect($e->errors())->flatten()->first() ?? 'Validation failed.',
                ], 422);
            }
            throw $e;
        }
    }
}

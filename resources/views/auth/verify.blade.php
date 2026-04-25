@extends('layouts.auth-plain')

@section('content')
<div class="petverse-verify-wrap">
    <div class="petverse-verify-card">
        <div class="petverse-verify-brand">
            <img src="/petlogo.png" alt="Petverse Logo" width="38" height="38">
            <span>Petverse</span>
        </div>
        <h1 class="petverse-verify-title">Verify your email</h1>
        <p class="petverse-verify-subtitle">
            Welcome to Petverse! Enter the 6-digit code sent to your inbox.
        </p>

        @if (session('status'))
            <div class="petverse-alert petverse-alert-success" role="alert">
                {{ session('status') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="petverse-alert petverse-alert-danger" role="alert">
                {{ $errors->first() }}
            </div>
        @endif

        <p class="petverse-email-note">
            Code sent to <strong>{{ $email }}</strong>
        </p>

        <form method="POST" action="{{ route('verification.verify') }}">
            @csrf
            <input
                id="verification_code"
                name="verification_code"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                class="petverse-code-input"
                value="{{ old('verification_code') }}"
                placeholder="000000"
                required
            >

            <button type="submit" class="petverse-btn petverse-btn-primary" style="margin-top: 14px;">
                Verify Account
            </button>
        </form>

        <form method="POST" action="{{ route('verification.resend') }}">
            @csrf
            <button type="submit" class="petverse-btn petverse-btn-secondary">
                Resend Code
            </button>
        </form>

        <div style="text-align: center;">
            <a href="{{ route('login') }}" class="petverse-login-link">Back to Login</a>
        </div>
    </div>
</div>
@endsection

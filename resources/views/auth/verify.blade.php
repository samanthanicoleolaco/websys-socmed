@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-7">
            <div class="card shadow-lg border-0 rounded-lg mt-5">
                <div class="card-header bg-white py-4 text-center border-0">
                    <div class="mb-3">
                        <i class="fas fa-envelope-open-text text-primary" style="font-size: 3rem;"></i>
                    </div>
                    <h3 class="fw-bold text-primary mb-1">{{ __('Verify Your Email Address') }}</h3>
                </div>

                <div class="card-body px-5 pb-5 text-center">
                    @if (session('resent'))
                        <div class="alert alert-success shadow-sm mb-4" role="alert">
                            {{ __('A fresh verification link has been sent to your email address.') }}
                        </div>
                    @endif

                    <p class="lead text-muted mb-4">
                        {{ __('Before proceeding, please check your email for a verification link.') }}
                        {{ __('If you did not receive the email') }},
                    </p>

                    <form class="d-inline" method="POST" action="{{ route('verification.resend') }}">
                        @csrf
                        <button type="submit" class="btn btn-primary btn-lg px-5 shadow-sm">
                            {{ __('Click here to request another') }}
                        </button>
                    </form>
                    
                    <div class="mt-4">
                        <a href="{{ route('logout') }}" class="text-decoration-none text-muted small" 
                           onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                            {{ __('Log Out') }}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@extends('layouts.app')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card shadow-lg border-0 rounded-lg">
                <div class="card-header bg-primary text-white py-3">
                    <h4 class="mb-0 fw-bold">Dashboard</h4>
                </div>

                <div class="card-body p-5 text-center">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    <div class="mb-4">
                        <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                    </div>
                    
                    <h2 class="display-6 mb-3">Welcome back!</h2>
                    <p class="lead text-muted mb-0">you are log in</p>
                    
                    <hr class="my-4">
                    
                    <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                        <a href="{{ url('/') }}" class="btn btn-outline-primary px-4">Go to App</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

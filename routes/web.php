<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Authentication routes (Public) - Must be ABOVE catch-all
Route::get('/login', [App\Http\Controllers\LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [App\Http\Controllers\LoginController::class, 'login']);
Route::get('/register', [App\Http\Controllers\RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [App\Http\Controllers\RegisterController::class, 'register']);
Route::post('/logout', [App\Http\Controllers\LoginController::class, 'logout'])->name('logout');

// Email Verification Routes (Public-ish, but check pending user)
Route::get('/email/verify', [App\Http\Controllers\VerificationController::class, 'show'])->name('verification.notice');
Route::post('/email/verify', [App\Http\Controllers\VerificationController::class, 'verify'])->name('verification.verify');
Route::post('/email/resend', [App\Http\Controllers\VerificationController::class, 'resend'])->name('verification.resend');

// Password Reset endpoints
Route::post('/password/check-email', [App\Http\Controllers\LoginController::class, 'checkEmail']);
Route::post('/password/reset', [App\Http\Controllers\LoginController::class, 'resetPassword']);

// Protected routes
Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });

    // Home redirect
    Route::get('/home', function() {
        return redirect('/homefeed');
    })->name('home');

    // SPA Catch-all (Protected)
    Route::get('/{any}', function () {
        return view('welcome');
    })->where('any', '.*');
});

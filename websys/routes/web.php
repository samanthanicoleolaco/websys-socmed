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

Route::get('/', function () {
    return view('welcome');
});

// Authentication routes
Route::get('/login', [App\Http\Controllers\LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [App\Http\Controllers\LoginController::class, 'login']);
Route::get('/register', [App\Http\Controllers\RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [App\Http\Controllers\RegisterController::class, 'register']);
Route::post('/logout', [App\Http\Controllers\LoginController::class, 'logout'])->name('logout');

// Password Reset endpoints (Fallback mapping for cached Javascript bundles)
Route::post('/password/check-email', [App\Http\Controllers\LoginController::class, 'checkEmail']);
Route::post('/password/reset', [App\Http\Controllers\LoginController::class, 'resetPassword']);


// SPA Catch-all Route for any other page
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');

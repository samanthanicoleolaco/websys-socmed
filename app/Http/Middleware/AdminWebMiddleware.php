<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminWebMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return redirect('/login');
        }
        if (!auth()->user()->is_admin) {
            return redirect('/homefeed');
        }
        return $next($request);
    }
}

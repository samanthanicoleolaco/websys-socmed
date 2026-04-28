<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BadgeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * GET /api/badges
     * Returns all badges with earned/in-progress status for the current user's pets.
     */
    public function index()
    {
        $userId = auth()->id();
        $petIds = Pet::where('user_id', $userId)->pluck('id');

        $allBadges = Badge::all();
        $earnedIds = DB::table('badge_pet')
            ->whereIn('pet_id', $petIds)
            ->pluck('badge_id')
            ->unique();

        return response()->json([
            'badges' => $allBadges->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'description' => $b->description,
                'icon' => $b->icon,
                'category' => $b->category,
                'status' => $earnedIds->contains($b->id) ? 'earned' : 'in-progress',
            ]),
            'earned_count' => $earnedIds->count(),
            'total_count' => $allBadges->count(),
        ]);
    }

    /**
     * GET /api/badges/leaderboard
     * Top 10 pets by post count, filterable by period.
     */
    public function leaderboard(Request $request)
    {
        $period = mb_strtolower($request->get('period', 'week'));
        $since = match ($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            default => null,
        };

        $q = Pet::withCount(['posts as score' => function ($q) use ($since) {
            if ($since) $q->where('created_at', '>=', $since);
        }, 'followers'])
            ->orderByDesc('score')
            ->take(10);

        return response()->json($q->get(['id', 'name', 'user_id'])->map(function ($p, $i) {
            return [
                'rank' => $i + 1,
                'name' => $p->name,
                'score' => $p->score,
                'followers' => $p->followers_count,
                'avatar' => $p->image_url,
            ];
        }));
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contest;
use App\Models\ContestEntry;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ContestController extends Controller
{
    public function index()
    {
        $contests = Contest::withCount('entries')
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_at')->orWhere('start_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_at')->orWhere('end_at', '>=', now());
            })
            ->orderByDesc('start_at')
            ->get();

        return response()->json($contests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after_or_equal:start_at'],
            'hashtag' => ['required', 'string', 'max:64'],
        ]);

        $contest = Contest::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'],
            'hashtag' => $validated['hashtag'],
            'is_active' => true,
        ]);

        return response()->json($contest->loadCount('entries'), 201);
    }

    public function show($id)
    {
        $contest = Contest::withCount('entries')->findOrFail($id);
        $entries = $contest->entries()->with('pet.user')->latest()->paginate(20);

        return response()->json([
            'contest' => $contest,
            'entries' => $entries,
        ]);
    }

    public function entries(Contest $contest)
    {
        return response()->json($contest->entries()->with('pet.user')->latest()->paginate(20));
    }

    public function enterContest(Request $request, Contest $contest)
    {
        $validated = $request->validate([
            'image' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $pet = Auth::user()->pets()->first();
        if (!$pet) {
            return response()->json(['message' => 'Please complete your pet profile first.'], 422);
        }

        $existing = ContestEntry::where('contest_id', $contest->id)
            ->where('pet_id', $pet->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'This pet has already entered this contest.'], 422);
        }

        $entry = ContestEntry::create([
            'contest_id' => $contest->id,
            'pet_id' => $pet->id,
            'image' => $validated['image'],
            'description' => $validated['description'] ?? null,
            'votes' => 0,
        ]);

        return response()->json($entry->load('pet.user'), 201);
    }

    public function vote(Request $request, ContestEntry $entry)
    {
        $user = Auth::user();

        $existing = DB::table('contest_votes')
            ->where('user_id', $user->id)
            ->where('contest_entry_id', $entry->id)
            ->first();

        if ($existing) {
            DB::table('contest_votes')
                ->where('user_id', $user->id)
                ->where('contest_entry_id', $entry->id)
                ->delete();

            $entry->decrement('votes');

            return response()->json([
                'voted' => false,
                'entry' => $entry->fresh(),
            ]);
        }

        DB::table('contest_votes')->insert([
            'user_id' => $user->id,
            'contest_entry_id' => $entry->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $entry->increment('votes');

        return response()->json([
            'voted' => true,
            'entry' => $entry->fresh(),
        ]);
    }

    public function update(Request $request, Contest $contest)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'start_at' => ['sometimes', 'required', 'date'],
            'end_at' => ['sometimes', 'required', 'date'],
            'hashtag' => ['sometimes', 'required', 'string', 'max:64'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $contest->update($validated);

        return response()->json($contest->loadCount('entries'));
    }

    public function destroy(Contest $contest)
    {
        $contest->delete();

        return response()->json(['message' => 'Contest deleted successfully']);
    }

    /**
     * GET /api/contests/live
     * Returns the nearest active contest (or null).
     */
    public function live()
    {
        $contest = Contest::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_at')->orWhere('start_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_at')->orWhere('end_at', '>=', now());
            })
            ->withCount('entries')
            ->orderBy('end_at')
            ->first();

        return response()->json($contest);
    }
}

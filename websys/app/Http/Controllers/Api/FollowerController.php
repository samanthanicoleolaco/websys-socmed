<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Follower;
use App\Models\Pet;
use Illuminate\Support\Facades\Auth;

class FollowerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Follow a pet
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'follower_pet_id' => 'required|exists:pets,id',
            'following_pet_id' => 'required|exists:pets,id',
        ]);

        // Check if user owns the follower pet
        $followerPet = Pet::findOrFail($validated['follower_pet_id']);
        if ($followerPet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent self-following
        if ($validated['follower_pet_id'] === $validated['following_pet_id']) {
            return response()->json(['message' => 'Cannot follow yourself'], 422);
        }

        // Check if already following
        $existing = Follower::where([
            'follower_pet_id' => $validated['follower_pet_id'],
            'following_pet_id' => $validated['following_pet_id'],
        ])->first();

        if ($existing) {
            return response()->json(['message' => 'Already following'], 422);
        }

        $follower = Follower::create($validated);

        return response()->json(['message' => 'Pet followed successfully', 'follower' => $follower->load(['followerPet.user', 'followingPet.user'])], 201);
    }

    /**
     * Unfollow a pet
     */
    public function destroy(Request $request, Pet $followingPet)
    {
        $followerPetIds = Auth::user()->pets()->pluck('id');

        $follower = Follower::where([
            'follower_pet_id' => $followerPetIds,
            'following_pet_id' => $followingPet->id,
        ])->first();

        if (!$follower) {
            return response()->json(['message' => 'Not following this pet'], 404);
        }

        $follower->delete();

        return response()->json(['message' => 'Pet unfollowed successfully']);
    }

    /**
     * Get followers of a pet
     */
    public function followers(Request $request, Pet $pet)
    {
        $followers = $pet->followers()->with('followerPet.user')->latest()->paginate(20);
        return response()->json($followers);
    }

    /**
     * Get pets that a pet is following
     */
    public function following(Request $request, Pet $pet)
    {
        $following = $pet->following()->with('followingPet.user')->latest()->paginate(20);
        return response()->json($following);
    }
}

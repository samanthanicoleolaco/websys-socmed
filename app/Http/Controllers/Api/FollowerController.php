<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Follower;
use App\Models\FollowRequest;
use App\Models\Pet;
use App\Models\Notification;
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
        $followingPet = Pet::findOrFail($validated['following_pet_id']);
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

        if ($followingPet->is_private && !$followingPet->user->is(Auth::user())) {
            $existingRequest = FollowRequest::where([
                'requester_pet_id' => $followerPet->id,
                'target_pet_id' => $followingPet->id,
                'status' => 'pending',
            ])->first();

            if ($existingRequest) {
                return response()->json(['status' => 'requested'], 201);
            }

            $followRequest = FollowRequest::create([
                'requester_pet_id' => $followerPet->id,
                'target_pet_id' => $followingPet->id,
                'status' => 'pending',
            ]);

            if ($followingPet->user_id !== Auth::id()) {
                Notification::createNotification(
                    $followingPet->user_id,
                    'follow_request',
                    'New follow request',
                    $followerPet->name . ' requested to follow your pet.',
                    $followRequest,
                    ['request_id' => $followRequest->id, 'follower_pet_id' => $followerPet->id, 'following_pet_id' => $followingPet->id]
                );
            }

            return response()->json(['status' => 'requested'], 201);
        }

        $follower = Follower::create($validated);

        $followingOwner = $followingPet->user;
        if ($followingOwner && $followingOwner->id !== Auth::id()) {
            Notification::createNotification(
                $followingOwner->id,
                'follow',
                'New follower',
                $followerPet->name . ' started following your pet.',
                $follower,
                ['following_pet_id' => $followingPet->id, 'follower_pet_id' => $followerPet->id]
            );
        }

        return response()->json(['message' => 'Pet followed successfully', 'follower' => $follower->load(['followerPet.user', 'followingPet.user'])], 201);
    }

    /**
     * Unfollow a pet
     */
    public function destroy(Request $request, Pet $followingPet)
    {
        $followerPetIds = Auth::user()->pets()->pluck('id');

        $follower = Follower::whereIn('follower_pet_id', $followerPetIds)
            ->where('following_pet_id', $followingPet->id)
            ->first();

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

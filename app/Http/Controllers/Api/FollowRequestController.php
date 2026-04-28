<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FollowRequest;
use App\Models\Follower;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowRequestController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $petIds = Auth::user()->pets()->pluck('id');

        $requests = FollowRequest::whereIn('target_pet_id', $petIds)
            ->where('status', 'pending')
            ->with(['requesterPet.user', 'targetPet.user'])
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    public function update(Request $request, FollowRequest $followRequest)
    {
        $data = $request->validate([
            'status' => ['required', 'in:accepted,rejected'],
        ]);

        $targetPet = $followRequest->targetPet;
        if (!$targetPet || $targetPet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($data['status'] === 'accepted') {
            $follower = Follower::firstOrCreate([
                'follower_pet_id' => $followRequest->requester_pet_id,
                'following_pet_id' => $followRequest->target_pet_id,
            ]);

            $requesterUserId = $followRequest->requesterPet?->user_id;
            if ($requesterUserId && $requesterUserId !== Auth::id()) {
                Notification::createNotification(
                    $requesterUserId,
                    'follow',
                    'Follow request accepted',
                    $targetPet->name . ' accepted your follow request.',
                    $follower,
                    ['following_pet_id' => $targetPet->id, 'follower_pet_id' => $followRequest->requester_pet_id]
                );
            }
        }

        $followRequest->delete();

        return response()->json(['status' => $data['status']]);
    }
}

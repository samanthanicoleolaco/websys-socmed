<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Pet;
use App\Models\ConversationState;
use App\Models\BlockedUser;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function getConversations(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $pet = Pet::where('user_id', $user->id)->first();
        if (!$pet) return response()->json([]);

        // Get unique conversations based on sent/received messages
        $blockedUserIds = BlockedUser::where('user_id', $user->id)
            ->pluck('blocked_user_id')
            ->toArray();
        $blockedByUserIds = BlockedUser::where('blocked_user_id', $user->id)
            ->pluck('user_id')
            ->toArray();

        $messages = Message::where('sender_pet_id', $pet->id)
            ->orWhere('receiver_pet_id', $pet->id)
            ->latest()
            ->get();

        $chats = [];
        $added = [];
        foreach ($messages as $msg) {
            $otherId = $msg->sender_pet_id == $pet->id ? $msg->receiver_pet_id : $msg->sender_pet_id;
            if (!in_array($otherId, $added)) {
                $otherPet = Pet::find($otherId);
                if ($otherPet
                    && !in_array($otherPet->user_id, $blockedUserIds, true)
                    && !in_array($otherPet->user_id, $blockedByUserIds, true)
                ) {
                    $state = ConversationState::where('user_id', $user->id)
                        ->where('buddy_id', $otherPet->user_id)
                        ->first();
                    $unreadCount = Message::where('sender_pet_id', $otherPet->id)
                        ->where('receiver_pet_id', $pet->id)
                        ->where('is_read', false)
                        ->count();

                    $chats[] = [
                        'id' => $otherPet->id,
                        'user_id' => $otherPet->id,
                        'buddy_user_id' => $otherPet->user_id,
                        'name' => $otherPet->name,
                        'preview' => $msg->content,
                        'time' => $msg->created_at->diffForHumans(),
                        'unread' => $unreadCount,
                        'bg' => '#F5A623',
                        'initial' => substr($otherPet->name, 0, 1),
                        'last_message_at' => $msg->created_at,
                        'archived_at' => $state?->archived_at,
                    ];
                    $added[] = $otherId;
                }
            }
        }

        return response()->json($chats);
    }

    public function getBuddies(Request $request) 
    {
        // For the "Start New Conversation" modal to fetch real users
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $myPetIds = $user ? $user->pets()->pluck('id')->toArray() : [];
        $buddies = Pet::whereNotIn('id', $myPetIds)->take(10)->get()->map(function($pet) {
            return [
                'id' => $pet->id,
                'name' => $pet->name,
                'preview' => $pet->breed . ' • Pet',
                'time' => 'Online',
                'bg' => '#3B82F6',
                'initial' => substr($pet->name, 0, 1)
            ];
        });

        return response()->json($buddies);
    }

    public function getMessages(Request $request, $buddy_id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);
        
        $myPet = $user->pets()->first();
        if (!$myPet) return response()->json([]);

        $messages = Message::where(function($q) use ($myPet, $buddy_id) {
            $q->where('sender_pet_id', $myPet->id)->where('receiver_pet_id', $buddy_id);
        })->orWhere(function($q) use ($myPet, $buddy_id) {
            $q->where('sender_pet_id', $buddy_id)->where('receiver_pet_id', $myPet->id);
        })->orderBy('created_at', 'asc')->get()->map(function($msg) use ($myPet) {
            return [
                'id' => $msg->id,
                'text' => $msg->content,
                'isSelf' => $msg->sender_pet_id == $myPet->id,
                'time' => $msg->created_at->format('g:i A'),
                'is_read' => (bool) $msg->is_read,
            ];
        });

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $myPet = $user->pets()->first();
        if (!$myPet) {
            return response()->json(['error' => 'No pet selected'], 422);
        }

        $request->validate([
            'receiver_id' => 'required|exists:pets,id',
            'content' => 'required|string',
            'image' => 'nullable|url',
            'video' => 'nullable|url',
            'location' => 'nullable|string|max:255',
            'location_lat' => 'nullable|numeric',
            'location_lon' => 'nullable|numeric',
        ]);

        $msg = Message::create([
            'sender_pet_id' => $myPet->id,
            'receiver_pet_id' => $request->receiver_id,
            'content' => $request->input('content'),
            'image' => $request->input('image'),
            'video' => $request->input('video'),
            'location' => $request->input('location'),
            'location_lat' => $request->input('location_lat'),
            'location_lon' => $request->input('location_lon'),
            'is_read' => false
        ]);

        return response()->json([
            'id' => $msg->id,
            'text' => $msg->content,
            'isSelf' => true,
            'time' => $msg->created_at->format('g:i A')
        ]);
    }

    public function clearChat(Request $request, $buddy_id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);
        
        $myPet = $user->pets()->first();
        if (!$myPet) return response()->json(['error' => 'No pet'], 404);

        // Delete all messages between both users.
        Message::where(function($q) use ($myPet, $buddy_id) {
            $q->where('sender_pet_id', $myPet->id)->where('receiver_pet_id', $buddy_id);
        })->orWhere(function($q) use ($myPet, $buddy_id) {
            $q->where('sender_pet_id', $buddy_id)->where('receiver_pet_id', $myPet->id);
        })->delete();

        return response()->json(['success' => true]);
    }

    public function archive(Request $request, $buddy_id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $buddyPet = Pet::find($buddy_id);
        if (!$buddyPet) return response()->json(['error' => 'Buddy not found'], 404);

        $state = ConversationState::updateOrCreate(
            ['user_id' => $user->id, 'buddy_id' => $buddyPet->user_id],
            ['archived_at' => now()]
        );

        return response()->json(['archived_at' => $state->archived_at]);
    }

    public function unarchive(Request $request, $buddy_id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $buddyPet = Pet::find($buddy_id);
        if (!$buddyPet) return response()->json(['error' => 'Buddy not found'], 404);

        $state = ConversationState::updateOrCreate(
            ['user_id' => $user->id, 'buddy_id' => $buddyPet->user_id],
            ['archived_at' => null]
        );

        return response()->json(['archived_at' => $state->archived_at]);
    }

    public function unsend(Request $request, $message_id) 
    {
        $msg = Message::findOrFail($message_id);
        $myPetIds = Auth::user()->pets()->pluck('id');
        abort_unless($myPetIds->contains($msg->sender_pet_id), 403);
        $msg->delete();
        return response()->json(['success' => true]);
    }
}

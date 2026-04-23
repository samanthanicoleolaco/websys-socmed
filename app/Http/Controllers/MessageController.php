<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function getConversations(Request $request)
    {
        $user = Auth::user();
        if (!$user) $user = User::first();
        if (!$user) return response()->json([]);

        $pet = Pet::where('user_id', $user->id)->first();
        if (!$pet) return response()->json([]);

        // Get unique conversations based on sent/received messages
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
                if ($otherPet) {
                    $chats[] = [
                        'id' => $otherPet->id,
                        'name' => $otherPet->name,
                        'preview' => $msg->content,
                        'time' => $msg->created_at->diffForHumans(),
                        'unread' => 0,
                        'bg' => '#F5A623',
                        'initial' => substr($otherPet->name, 0, 1)
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
        if (!$user) $user = User::first();
        
        // Ensure there are some dummy pets to chat with if DB is empty
        if (Pet::count() < 3) {
            $dummyUsers = [
                ['name' => 'David', 'email' => 'david@fake.com'],
                ['name' => 'Emily', 'email' => 'emily@fake.com'],
                ['name' => 'Jake', 'email' => 'jake@fake.com']
            ];
            foreach ($dummyUsers as $du) {
                $u = User::firstOrCreate(['email' => $du['email']], [
                    'name' => $du['name'],
                    'password' => bcrypt('password')
                ]);
                Pet::firstOrCreate(['user_id' => $u->id], [
                    'name' => $u->name . "'s Pet",
                    'age' => 2,
                    'breed' => 'Mixed dog',
                    'bio' => 'A very playful friend.'
                ]);
            }
        }

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
        if (!$user) $user = User::first();
        if (!$user) return response()->json([]);
        
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
                'time' => $msg->created_at->format('g:i A')
            ];
        });

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) $user = User::first();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $myPet = $user->pets()->first();
        if (!$myPet) {
            // Auto-create a pet for this user so they can send messages!
            $myPet = Pet::create([
                'user_id' => $user->id,
                'name' => 'My First Pet',
                'age' => 1,
                'breed' => 'Unknown'
            ]);
        }

        $request->validate([
            'receiver_id' => 'required|exists:pets,id',
            'content' => 'required|string'
        ]);

        $msg = Message::create([
            'sender_pet_id' => $myPet->id,
            'receiver_pet_id' => $request->receiver_id,
            'content' => $request->input('content'),
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
        if (!$user) $user = User::first();
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

    public function unsend(Request $request, $message_id) 
    {
        Message::where('id', $message_id)->delete();
        return response()->json(['success' => true]);
    }
}

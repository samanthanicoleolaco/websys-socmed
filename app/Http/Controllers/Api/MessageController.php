<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Pet;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
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

        // Blocked users
        $blockedUserIds = BlockedUser::where('user_id', $user->id)->pluck('blocked_user_id')->toArray();
        $blockedByUserIds = BlockedUser::where('blocked_user_id', $user->id)->pluck('user_id')->toArray();

        // 1. Get Legacy Chats (1-on-1)
        $messages = Message::where(function($q) use ($pet) {
                $q->where('sender_pet_id', $pet->id)->orWhere('receiver_pet_id', $pet->id);
            })
            ->whereNull('conversation_id')
            ->latest()
            ->get();

        $chats = [];
        $added = [];
        foreach ($messages as $msg) {
            $otherId = $msg->sender_pet_id == $pet->id ? $msg->receiver_pet_id : $msg->sender_pet_id;
            if (!in_array($otherId, $added)) {
                $otherPet = Pet::find($otherId);
                if ($otherPet && !in_array($otherPet->user_id, $blockedUserIds) && !in_array($otherPet->user_id, $blockedByUserIds)) {
                    $state = ConversationState::where('user_id', $user->id)->where('buddy_id', $otherPet->user_id)->first();
                    $unreadCount = Message::where('sender_pet_id', $otherPet->id)->where('receiver_pet_id', $pet->id)->where('is_read', false)->whereNull('conversation_id')->count();

                    $chats[] = [
                        'id' => $otherPet->id,
                        'user_id' => $otherPet->id,
                        'isGroup' => false,
                        'name' => $otherPet->name,
                        'avatar' => $otherPet->photo ? asset('storage/'.$otherPet->photo) : null,
                        'preview' => $msg->content,
                        'time' => $msg->created_at->diffForHumans(),
                        'unread' => $unreadCount,
                        'last_message_at' => $msg->created_at,
                        'archived_at' => $state?->archived_at,
                    ];
                    $added[] = $otherId;
                }
            }
        }

        // 2. Get Group Chats
        $groupConvs = Conversation::whereHas('participants', function($q) use ($pet) {
            $q->where('pet_id', $pet->id);
        })->with(['messages' => function($q) { $q->latest()->limit(1); }, 'participants.pet'])->get();

        foreach ($groupConvs as $conv) {
            $lastMsg = $conv->messages->first();
            $chats[] = [
                'id' => 'gc_' . $conv->id,
                'conversation_id' => $conv->id,
                'isGroup' => true,
                'name' => $conv->name ?: 'Group Chat',
                'avatar' => null,
                'preview' => $lastMsg ? $lastMsg->content : 'Group created',
                'time' => $lastMsg ? $lastMsg->created_at->diffForHumans() : $conv->created_at->diffForHumans(),
                'unread' => 0,
                'last_message_at' => $lastMsg ? $lastMsg->created_at : $conv->created_at,
            ];
        }

        usort($chats, function($a, $b) {
            return strtotime($b['last_message_at']) - strtotime($a['last_message_at']);
        });

        return response()->json($chats);
    }

    public function getBuddies(Request $request) 
    {
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

        if (str_starts_with($buddy_id, 'gc_')) {
            $convId = str_replace('gc_', '', $buddy_id);
            $query = Message::where('conversation_id', $convId);
        } else {
            $query = Message::whereNull('conversation_id')->where(function($q) use ($myPet, $buddy_id) {
                $q->where(function($sq) use ($myPet, $buddy_id) {
                    $sq->where('sender_pet_id', $myPet->id)->where('receiver_pet_id', $buddy_id);
                })->orWhere(function($sq) use ($myPet, $buddy_id) {
                    $sq->where('sender_pet_id', $buddy_id)->where('receiver_pet_id', $myPet->id);
                });
            });
        }

        $messages = $query->with('senderPet')->orderBy('created_at', 'asc')->get()->map(function($msg) use ($myPet) {
            $mediaUrl = $msg->image ?: $msg->video ?: null;
            $mediaType = $msg->image ? 'image' : ($msg->video ? 'video' : null);
            
            return [
                'id' => $msg->id,
                'text' => $msg->content,
                'isSelf' => $msg->sender_pet_id == $myPet->id,
                'media_url' => $mediaUrl,
                'media_type' => $mediaType,
                'time' => $msg->created_at->format('g:i A'),
                'is_read' => (bool) $msg->is_read,
                'sender' => [
                    'name' => $msg->senderPet?->name ?? 'User',
                    'avatar' => $msg->senderPet?->photo ? asset('storage/'.$msg->senderPet->photo) : null,
                ],
                'created_at' => optional($msg->created_at)->toISOString(),
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
            'receiver_id' => 'required|string', 
            'content'     => 'nullable|string',
            'media'       => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,webm,pdf,doc,docx,zip|max:51200',
        ]);

        $imageUrl = null;
        $videoUrl = null;
        $mediaType = null;

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $mime = $file->getMimeType();
            if (str_starts_with($mime, 'video/')) {
                $path = $file->store('messages/videos', 'public');
                $videoUrl = asset('storage/' . $path);
                $mediaType = 'video';
            } elseif (str_starts_with($mime, 'image/')) {
                $path = $file->store('messages/images', 'public');
                $imageUrl = asset('storage/' . $path);
                $mediaType = 'image';
            } else {
                $path = $file->store('messages/files', 'public');
                $imageUrl = asset('storage/' . $path); 
                $mediaType = 'file';
            }
        }

        if (!$request->input('content') && !$mediaType) {
            return response()->json(['error' => 'Message must have content or media.'], 422);
        }

        $receiverId = $request->receiver_id;
        $convId = null;
        if (str_starts_with($receiverId, 'gc_')) {
            $convId = str_replace('gc_', '', $receiverId);
            $receiverId = null;
        }

        $msg = Message::create([
            'sender_pet_id'   => $myPet->id,
            'receiver_pet_id' => $receiverId,
            'conversation_id' => $convId,
            'content'         => $request->input('content') ?? ($mediaType === 'video' ? '📹 Video' : ($mediaType === 'image' ? '📷 Photo' : '📎 File')),
            'image'           => $imageUrl,
            'video'           => $videoUrl,
            'is_read'         => false,
        ]);

        return response()->json([
            'id'         => $msg->id,
            'text'       => $msg->content,
            'media_url'  => $imageUrl ?? $videoUrl,
            'media_type' => $mediaType,
            'isSelf'     => true,
            'time'       => $msg->created_at->format('g:i A'),
            'is_read'    => (bool) $msg->is_read,
            'created_at' => optional($msg->created_at)->toISOString(),
            'updated_at' => optional($msg->updated_at)->toISOString(),
        ]);
    }

    public function createConversation(Request $request)
    {
        $request->validate([
            'member_ids' => 'required|array|min:1',
            'name'       => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        $myPet = $user->pets()->first();
        if (!$myPet) return response()->json(['error' => 'User must have a pet'], 422);

        $conversation = Conversation::create([
            'name'           => $request->name,
            'creator_pet_id' => $myPet->id,
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'pet_id'          => $myPet->id,
        ]);

        foreach ($request->member_ids as $petId) {
            if ($petId == $myPet->id) continue;
            ConversationParticipant::firstOrCreate([
                'conversation_id' => $conversation->id,
                'pet_id'          => $petId,
            ]);
        }

        return response()->json([
            'id' => 'gc_' . $conversation->id,
            'conversation_id' => $conversation->id,
            'name' => $conversation->name ?: 'Group Chat',
            'isGroup' => true,
            'last_message_at' => $conversation->created_at,
        ], 201);
    }

    public function clearChat(Request $request, $buddy_id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);
        
        $myPet = $user->pets()->first();
        if (!$myPet) return response()->json(['error' => 'No pet'], 404);

        if (str_starts_with($buddy_id, 'gc_')) {
            $convId = str_replace('gc_', '', $buddy_id);
            $conv = Conversation::find($convId);
            if (!$conv) return response()->json(['error' => 'Group chat not found'], 404);

            if ($conv->creator_pet_id == $myPet->id) {
                Message::where('conversation_id', $convId)->delete();
                ConversationParticipant::where('conversation_id', $convId)->delete();
                $conv->delete();
            } else {
                ConversationParticipant::where('conversation_id', $convId)
                    ->where('pet_id', $myPet->id)
                    ->delete();
            }
        } else {
            Message::where(function($q) use ($myPet, $buddy_id) {
                $q->where('sender_pet_id', $myPet->id)->where('receiver_pet_id', $buddy_id);
            })->orWhere(function($q) use ($myPet, $buddy_id) {
                $q->where('sender_pet_id', $buddy_id)->where('receiver_pet_id', $myPet->id);
            })->delete();
        }

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

    public function markAsRead(Request $request, $messageId)
    {
        $message = Message::findOrFail($messageId);
        $message->update(['is_read' => true]);
        return response()->json(['message' => 'Message marked as read']);
    }

    public function addMember(Request $request, Conversation $conversation)
    {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
        ]);

        $exists = $conversation->participants()->where('pet_id', $request->pet_id)->exists();
        if ($exists) {
            return response()->json(['message' => 'Pet already in conversation'], 422);
        }

        $conversation->participants()->create([
            'pet_id' => $request->pet_id,
        ]);

        return response()->json(['message' => 'Member added successfully']);
    }

    public function updateConversation(Request $request, Conversation $conversation)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $conversation->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Conversation renamed successfully',
            'conversation' => $conversation
        ]);
    }
}

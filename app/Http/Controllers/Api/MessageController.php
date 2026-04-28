<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\ConversationState;
use App\Models\BlockedUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function getConversations(Request $request)
    {
        $userId = Auth::id();
        
        $blockedUserIds = BlockedUser::where('user_id', $userId)
            ->orWhere('blocked_user_id', $userId)
            ->get()
            ->pluck(function ($block) use ($userId) {
                return $block->user_id === $userId ? $block->blocked_user_id : $block->user_id;
            })
            ->unique()
            ->toArray();

        $sentMessages = Message::where('sender_id', $userId)
            ->whereNotIn('receiver_id', $blockedUserIds)
            ->selectRaw('receiver_id as user_id, MAX(id) as last_message_id, MAX(created_at) as last_message_at')
            ->groupBy('receiver_id');
        
        $receivedMessages = Message::where('receiver_id', $userId)
            ->whereNotIn('sender_id', $blockedUserIds)
            ->selectRaw('sender_id as user_id, MAX(id) as last_message_id, MAX(created_at) as last_message_at')
            ->groupBy('sender_id');

        $conversations = $sentMessages->union($receivedMessages)
            ->orderBy('last_message_at', 'desc')
            ->get();

        $conversations = $conversations->map(function ($conv) use ($userId) {
            $otherUserId = $conv->user_id;
            $otherUser = User::with('pet')->find($otherUserId);
            
            if (!$otherUser) {
                return null;
            }

            $lastMessage = Message::find($conv->last_message_id);
            $unreadCount = Message::where('sender_id', $otherUserId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            $conversationState = ConversationState::where('user_id', $userId)
                ->where('buddy_id', $otherUserId)
                ->first();

            return [
                'id' => $conv->user_id,
                'user_id' => $otherUserId,
                'name' => $otherUser->name,
                'avatar' => $otherUser->avatar_url,
                'pet' => $otherUser->pet,
                'preview' => $lastMessage ? $lastMessage->content : '',
                'time' => $lastMessage ? $lastMessage->created_at->diffForHumans() : '',
                'unread' => $unreadCount,
                'last_message_at' => $conv->last_message_at,
                'archived_at' => $conversationState ? $conversationState->archived_at : null,
            ];
        })->filter();

        return response()->json($conversations->values());
    }

    public function getMessages(Request $request, $buddyId)
    {
        $userId = Auth::id();
        
        $messages = Message::where(function ($query) use ($userId, $buddyId) {
            $query->where('sender_id', $userId)->where('receiver_id', $buddyId);
        })->orWhere(function ($query) use ($userId, $buddyId) {
            $query->where('sender_id', $buddyId)->where('receiver_id', $userId);
        })->with('sender.pet', 'receiver.pet')->orderBy('created_at', 'asc')->get();

        $messages = $messages->map(function ($msg) use ($userId) {
            return [
                'id' => $msg->id,
                'text' => $msg->content,
                'isSelf' => $msg->sender_id === $userId,
                'is_read' => $msg->is_read,
                'sender' => $msg->sender,
                'receiver' => $msg->receiver,
                'created_at' => $msg->created_at,
            ];
        });

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
            'is_read' => false,
        ]);

        return response()->json($message->load('sender.pet', 'receiver.pet'), 201);
    }

    public function markAsRead(Request $request, $messageId)
    {
        $message = Message::findOrFail($messageId);
        
        if ($message->receiver_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->update(['is_read' => true]);
        return response()->json(['message' => 'Message marked as read']);
    }

    public function archive(Request $request, $buddyId)
    {
        ConversationState::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'buddy_id' => $buddyId,
            ],
            [
                'archived_at' => now(),
            ]
        );

        return response()->json(['message' => 'Conversation archived']);
    }

    public function unarchive(Request $request, $buddyId)
    {
        ConversationState::where('user_id', Auth::id())
            ->where('buddy_id', $buddyId)
            ->update(['archived_at' => null]);

        return response()->json(['message' => 'Conversation unarchived']);
    }
}

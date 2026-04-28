<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Pet;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index']);
    }

    /**
     * Display comments for a specific post
     */
    public function index(Request $request, Post $post)
    {
        $comments = $post->comments()->with('pet.user')->latest()->paginate(20);
        return response()->json($comments);
    }

    /**
     * Store a newly created comment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'pet_id' => 'required|exists:pets,id',
            'content' => 'required|string|max:1000',
        ]);

        // Check if user owns the pet
        $pet = Pet::findOrFail($validated['pet_id']);
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = Comment::create($validated);

        $postOwner = $comment->post->pet->user ?? null;
        if ($postOwner && $postOwner->id !== Auth::id()) {
            Notification::createNotification(
                $postOwner->id,
                'comment',
                'New comment on your post',
                $pet->name . ' commented on your post.',
                $comment,
                ['post_id' => $comment->post_id, 'comment_id' => $comment->id]
            );
        }

        return response()->json($comment->load('pet.user'), 201);
    }

    /**
     * Display the specified comment
     */
    public function show(Comment $comment)
    {
        return response()->json($comment->load('pet.user'));
    }

    /**
     * Update the specified comment
     */
    public function update(Request $request, Comment $comment)
    {
        if ($comment->pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'sometimes|required|string|max:1000',
        ]);

        $comment->update($validated);

        return response()->json($comment->load('pet.user'));
    }

    /**
     * Remove the specified comment
     */
    public function destroy(Comment $comment)
    {
        if ($comment->pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}

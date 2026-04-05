<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Like;
use App\Models\Post;
use App\Models\Pet;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Store a new like or toggle existing like
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'pet_id' => 'required|exists:pets,id',
            'emoji' => 'sometimes|string|max:10',
        ]);

        // Check if user owns the pet
        $pet = Pet::findOrFail($validated['pet_id']);
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $existingLike = Like::where([
            'post_id' => $validated['post_id'],
            'pet_id' => $validated['pet_id'],
        ])->first();

        if ($existingLike) {
            // Toggle like: remove if same emoji, update if different
            if ($existingLike->emoji === ($validated['emoji'] ?? '❤️')) {
                $existingLike->delete();
                return response()->json(['message' => 'Like removed', 'liked' => false]);
            } else {
                $existingLike->update(['emoji' => $validated['emoji'] ?? '❤️']);
                return response()->json(['message' => 'Emoji updated', 'like' => $existingLike->load('pet.user')]);
            }
        }

        $like = Like::create([
            'post_id' => $validated['post_id'],
            'pet_id' => $validated['pet_id'],
            'emoji' => $validated['emoji'] ?? '❤️',
        ]);

        return response()->json(['message' => 'Post liked', 'like' => $like->load('pet.user')], 201);
    }

    /**
     * Remove a like
     */
    public function destroy(Request $request, Post $post, Pet $pet)
    {
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $like = Like::where([
            'post_id' => $post->id,
            'pet_id' => $pet->id,
        ])->first();

        if (!$like) {
            return response()->json(['message' => 'Like not found'], 404);
        }

        $like->delete();

        return response()->json(['message' => 'Like removed']);
    }

    /**
     * Get likes for a post
     */
    public function index(Request $request, Post $post)
    {
        $likes = $post->likes()->with('pet.user')->latest()->paginate(50);
        return response()->json($likes);
    }
}

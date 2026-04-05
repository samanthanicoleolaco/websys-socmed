<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Pet;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    /**
     * Display a listing of posts from followed pets with pagination
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Post::with(['pet.user', 'likes', 'comments']);

        // If authenticated, show posts from followed pets, otherwise show all posts
        if ($user) {
            $followedPetIds = $user->pets()->with('following')->get()
                ->pluck('following.*.following_pet_id')->flatten()->unique();
            
            if ($followedPetIds->isNotEmpty()) {
                $query->whereIn('pet_id', $followedPetIds);
            }
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('caption', 'like', '%' . $search . '%');
        }

        $posts = $query->latest()->paginate(15);

        return response()->json($posts);
    }

    /**
     * Store a newly created post
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'caption' => 'required|string|max:2000',
            'image' => 'nullable|string',
            'video' => 'nullable|string',
        ]);

        // Check if user owns the pet
        $pet = Pet::findOrFail($validated['pet_id']);
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post = Post::create($validated);

        return response()->json($post->load(['pet.user', 'likes', 'comments']), 201);
    }

    /**
     * Display the specified post
     */
    public function show(Post $post)
    {
        return response()->json($post->load(['pet.user', 'likes', 'comments.pet']));
    }

    /**
     * Update the specified post
     */
    public function update(Request $request, Post $post)
    {
        if ($post->pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'caption' => 'sometimes|required|string|max:2000',
            'image' => 'sometimes|nullable|string',
            'video' => 'sometimes|nullable|string',
        ]);

        $post->update($validated);

        return response()->json($post->load(['pet.user', 'likes', 'comments']));
    }

    /**
     * Remove the specified post
     */
    public function destroy(Post $post)
    {
        if ($post->pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}

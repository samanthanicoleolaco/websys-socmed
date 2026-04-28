<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedPost;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedPostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $savedPosts = SavedPost::where('user_id', Auth::id())
            ->with(['post.pet.user', 'post.likes', 'post.comments'])
            ->latest()
            ->paginate(20);

        $petIds = Auth::user()->pets->pluck('id');
        $savedPosts->getCollection()->transform(function ($savedPost) use ($petIds) {
            $post = $savedPost->post;
            $post->liked_by_me = $petIds->isNotEmpty()
                ? $post->likes->pluck('pet_id')->intersect($petIds)->isNotEmpty()
                : false;
            $post->likes_count = $post->likes->count();
            $post->comments_count = $post->comments->count();
            return $savedPost;
        });

        return response()->json($savedPosts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);

        $existing = SavedPost::where([
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
        ])->first();

        if ($existing) {
            return response()->json(['message' => 'Post already saved'], 422);
        }

        $savedPost = SavedPost::create([
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
        ]);

        return response()->json($savedPost->load('post'), 201);
    }

    public function destroy(Post $post)
    {
        $savedPost = SavedPost::where([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
        ])->first();

        if (!$savedPost) {
            return response()->json(['message' => 'Saved post not found'], 404);
        }

        $savedPost->delete();
        return response()->json(['message' => 'Post removed from saved']);
    }
}

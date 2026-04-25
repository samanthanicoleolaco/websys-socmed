<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Pet;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    public function index(Request $request)
    {
        $query = Post::with(['pet.user', 'likes', 'comments']);

        if ($request->has('search')) {
            $query->where('caption', 'like', '%' . $request->get('search') . '%');
        }

        if ($request->has('hashtag')) {
            $hashtag = $request->get('hashtag');
            if (!str_starts_with($hashtag, '#')) {
                $hashtag = '#' . $hashtag;
            }
            $query->where('caption', 'like', '%' . $hashtag . '%');
        }

        $posts = $query->latest()->paginate(20);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'caption'  => 'required|string|max:2000',
            'image'    => 'nullable|image|max:10240',
            'video'    => 'nullable|mimetypes:video/mp4,video/quicktime,video/webm|max:51200',
            'location' => 'nullable|string|max:255',
            'location_lat' => 'nullable|numeric',
            'location_lon' => 'nullable|numeric',
            'location_place_id' => 'nullable|string|max:255',
            'tagged_pets' => 'nullable|json',
        ]);

        $user = Auth::user();

        // Get user's first pet; create anonymous mapping if none
        $pet = Pet::where('user_id', $user->id)->first();
        if (!$pet) {
            return response()->json(['message' => 'You need a pet profile to post.'], 422);
        }

        $imagePath = null;
        $videoPath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts/images', 'public');
        }

        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('posts/videos', 'public');
        }

        $taggedPets = $request->input('tagged_pets') ? json_decode($request->input('tagged_pets'), true) : null;

        $post = Post::create([
            'pet_id'  => $pet->id,
            'caption' => $request->caption,
            'image'   => $imagePath,
            'video'   => $videoPath,
            'location' => $request->location,
            'location_lat' => $request->location_lat,
            'location_lon' => $request->location_lon,
            'location_place_id' => $request->location_place_id,
            'tagged_pets' => $taggedPets,
        ]);

        return response()->json($post->load(['pet.user', 'likes', 'comments']), 201);
    }

    public function show(Post $post)
    {
        return response()->json($post->load(['pet.user', 'likes', 'comments.pet']));
    }

    public function update(Request $request, Post $post)
    {
        if ($post->pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'caption' => 'sometimes|required|string|max:2000',
        ]);

        $post->update($request->only('caption'));
        return response()->json($post->load(['pet.user', 'likes', 'comments']));
    }

    public function destroy(Post $post)
    {
        if ($post->pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($post->image) Storage::disk('public')->delete($post->image);
        if ($post->video) Storage::disk('public')->delete($post->video);

        $post->delete();
        return response()->json(['message' => 'Post deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Pet;
use App\Models\Notification;
use App\Models\PostReport;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'trendingTags']);
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

        $user = Auth::user();
        $petIds = $user ? $user->pets->pluck('id') : collect();
        $savedPostIds = $user ? $user->savedPosts->pluck('post_id')->toArray() : [];

        // Transform tagged_pets IDs into Pet objects
        $posts->getCollection()->transform(function ($post) use ($petIds, $savedPostIds) {
            if ($post->tagged_pets && is_array($post->tagged_pets)) {
                $post->tagged_pets = Pet::whereIn('id', $post->tagged_pets)->get();
            }
            $post->liked_by_me = $petIds->isNotEmpty()
                ? $post->likes->pluck('pet_id')->intersect($petIds)->isNotEmpty()
                : false;
            $post->is_saved = in_array($post->id, $savedPostIds);
            $post->likes_count = $post->likes->count();
            $post->comments_count = $post->comments->count();
            return $post;
        });

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
            'privacy' => 'nullable|string|in:public,friends,followers',
        ]);

        $user = Auth::user();

        // Get user's first pet; create a default one if none exists to ensure posting works
        $pet = Pet::where('user_id', $user->id)->first();
        if (!$pet) {
            $pet = Pet::create([
                'user_id' => $user->id,
                'name' => $user->name . "'s Pet",
                'breed' => 'Golden Retriever', // Default fallback
                'age' => 2,
                'bio' => 'A happy pet on Petverse!',
            ]);
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
            'privacy' => $request->input('privacy', 'public'),
        ]);

        // Resolve tagged pets ONCE into a Collection of Eloquent models. Iterate as
        // objects for notifications and only attach to the response at the end.
        // Reassigning $post->tagged_pets here would round-trip through the array
        // cast and yield arrays of arrays — which causes
        // "Attempt to read property 'user_id' on array".
        $taggedPetModels = collect();
        if (is_array($taggedPets) && count($taggedPets) > 0) {
            $taggedPetModels = Pet::whereIn('id', $taggedPets)->get();

            foreach ($taggedPetModels as $taggedPet) {
                if ((int) $taggedPet->user_id === (int) $user->id) {
                    continue;
                }

                Notification::createNotification(
                    $taggedPet->user_id,
                    'tag',
                    'You were tagged in a post',
                    $user->name . ' tagged your pet in a post.',
                    $post,
                    ['post_id' => $post->id, 'pet_id' => $taggedPet->id]
                );
            }
        }

        $response = $post->load(['pet.user', 'likes', 'comments']);
        if ($taggedPetModels->isNotEmpty()) {
            // Use setAttribute so we override the cast for the JSON response only.
            $response->setAttribute('tagged_pets', $taggedPetModels);
        }

        return response()->json($response, 201);
    }

    public function show(Post $post)
    {
        $post->load(['pet.user', 'likes', 'comments.pet']);
        $petIds = Auth::check() ? Auth::user()->pets->pluck('id') : collect();
        $post->liked_by_me = $petIds->isNotEmpty()
            ? $post->likes->pluck('pet_id')->intersect($petIds)->isNotEmpty()
            : false;
        $post->likes_count = $post->likes->count();
        $post->comments_count = $post->comments->count();

        return response()->json($post);
    }

    public function update(Request $request, Post $post)
    {
        if ($post->pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'caption' => 'sometimes|required|string|max:2000',
            'privacy' => 'sometimes|required|string|in:public,friends,followers',
        ]);

        $post->update($request->only(['caption', 'privacy']));
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

    public function report(Request $request, Post $post)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $existingReport = PostReport::where([
            'reporter_id' => Auth::id(),
            'post_id' => $post->id,
        ])->first();

        if ($existingReport) {
            return response()->json(['message' => 'You have already reported this post'], 422);
        }

        $report = PostReport::create([
            'reporter_id' => Auth::id(),
            'post_id' => $post->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json($report, 201);
    }

    /**
     * GET /api/trending-tags
     * Top 5 hashtags by post count + total likes in the last 7 days.
     * Live contest hashtag is pinned first.
     */
    public function trendingTags()
    {
        $since = now()->subDays(7);

        $tagCounts = [];
        Post::where('created_at', '>=', $since)
            ->withCount('likes')
            ->get(['caption'])
            ->each(function ($post) use (&$tagCounts) {
                preg_match_all('/#(\w+)/u', (string) $post->caption, $m);
                foreach ($m[1] as $tag) {
                    $tag = mb_strtolower($tag);
                    if (!isset($tagCounts[$tag])) {
                        $tagCounts[$tag] = ['tag' => $tag, 'posts' => 0, 'likes' => 0];
                    }
                    $tagCounts[$tag]['posts']++;
                    $tagCounts[$tag]['likes'] += $post->likes_count;
                }
            });

        $sorted = collect($tagCounts)
            ->sortByDesc(fn($t) => $t['posts'] * 5 + $t['likes'])
            ->values();

        // Pin live contest hashtag at index 0
        $liveContest = \App\Models\Contest::where('end_at', '>=', now())
            ->where('is_active', true)
            ->orderBy('end_at')
            ->first();
        if ($liveContest && $liveContest->hashtag) {
            $hashtag = ltrim(mb_strtolower($liveContest->hashtag), '#');
            $existing = $sorted->firstWhere('tag', $hashtag);
            $sorted = $sorted->reject(fn($t) => $t['tag'] === $hashtag)->prepend([
                'tag'   => $hashtag,
                'posts' => $existing['posts'] ?? 0,
                'likes' => $existing['likes'] ?? 0,
                'live_contest' => true,
            ]);
        }

        return response()->json($sorted->take(5)->values());
    }
}

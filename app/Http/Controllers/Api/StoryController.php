<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\StoryView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class StoryController extends Controller
{
    public function index(Request $request)
    {
        // Fetch active stories (unexpired) grouped by user
        $stories = Story::with(['user.pet'])
            ->where('expires_at', '>', Carbon::now())
            ->where('is_archived', false)
            ->whereDoesntHave('user.pet', function ($query) {
                $query->where('name', 'Max');
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('user_id')
            ->map(function ($userStories) {
                $latest = $userStories->first();
                return [
                    'user' => $latest->user,
                    'stories' => $userStories,
                    'latest_story' => $latest,
                    'count' => $userStories->count(),
                ];
            })
            ->values();
            
        return response()->json($stories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'media' => 'required|file|mimes:jpeg,png,jpg,webp,mp4,mov,avi,webm,quicktime|max:51200',
            'caption' => 'nullable|string|max:255',
        ]);

        if (!$request->hasFile('media')) {
            return response()->json(['message' => 'No media file provided.'], 400);
        }

        $file = $request->file('media');
        $mime = $file->getMimeType();
        $is_video = str_starts_with($mime, 'video/');
        $type = $is_video ? 'video' : 'image';

        $path = $file->store('stories', 'public');

        $story = Story::create([
            'user_id' => $request->user()->id,
            'media_path' => $path,
            'media_type' => $type,
            'caption' => $request->caption,
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        $story->load('user.pet');

        return response()->json($story, 201);
    }

    public function destroy(Story $story)
    {
        if ($story->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($story->media_path) {
            Storage::disk('public')->delete($story->media_path);
        }
        $story->delete();

        return response()->json(['message' => 'Story deleted successfully']);
    }

    public function archive(Story $story)
    {
        if ($story->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $story->update(['is_archived' => true]);

        return response()->json(['message' => 'Story archived successfully']);
    }

    public function markAsViewed(Request $request, Story $story)
    {
        StoryView::firstOrCreate([
            'story_id' => $story->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Marked as viewed']);
    }
}

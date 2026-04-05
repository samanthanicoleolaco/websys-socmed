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
        // Fetch active stories (unexpired). 
        // This query can be further customized to filter down to only `following` users.
        $activeStories = Story::with(['user'])->withCount('views')
            ->where('expires_at', '>', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($activeStories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'media' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi|max:20480',
            'caption' => 'nullable|string|max:255',
        ]);

        $path = $request->file('media')->store('stories', 'public');
        $extension = $request->file('media')->getClientOriginalExtension();
        $type = in_array(strtolower($extension), ['mp4', 'mov', 'avi']) ? 'video' : 'image';

        $story = Story::create([
            'user_id' => $request->user()->id,
            'media_path' => $path,
            'media_type' => $type,
            'caption' => $request->caption,
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        return response()->json($story, 201);
    }

    public function destroy(Story $story)
    {
        if ($story->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('public')->delete($story->media_path);
        $story->delete();

        return response()->json(['message' => 'Story deleted successfully']);
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

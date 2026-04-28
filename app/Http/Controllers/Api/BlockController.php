<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlockController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $blocks = BlockedUser::where('user_id', Auth::id())
            ->with('blockedUser')
            ->latest()
            ->get();

        return response()->json($blocks);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'blocked_user_id' => ['required', 'exists:users,id'],
        ]);

        if ((int) $data['blocked_user_id'] === (int) Auth::id()) {
            return response()->json(['message' => 'Cannot block yourself'], 422);
        }

        $block = BlockedUser::firstOrCreate([
            'user_id' => Auth::id(),
            'blocked_user_id' => $data['blocked_user_id'],
        ]);

        return response()->json($block, 201);
    }

    public function destroy(BlockedUser $block)
    {
        if ($block->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $block->delete();

        return response()->json(['message' => 'Block removed']);
    }
}

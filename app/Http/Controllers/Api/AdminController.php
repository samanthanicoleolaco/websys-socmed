<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pet;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Login;
use App\Models\LoginAudit;
use App\Models\AdoptionListing;
use App\Models\Contest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * GET /api/admin/stats
     * Returns counts for dashboard metric cards.
     */
    public function stats()
    {
        return response()->json([
            'total_users'       => User::count(),
            'total_pets'        => Pet::count(),
            'total_posts'       => Post::count(),
            'total_comments'    => Comment::count(),
            'active_adoptions'  => AdoptionListing::where('status', 'available')->count(),
            'active_contests'   => Contest::count(),
        ]);
    }

    /**
     * GET /api/admin/users
     * Paginated list of all users with pet count.
     */
    public function users(Request $request)
    {
        $users = User::withCount('pets')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        return response()->json($users);
    }

    /**
     * DELETE /api/admin/users/{user}
     * Delete a user account.
     */
    public function deleteUser(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }

    /**
     * PUT /api/admin/users/{user}
     * Update user details (name, email, is_admin, is_banned).
     */
    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name'      => 'sometimes|required|string|max:120',
            'email'     => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'is_admin'  => 'sometimes|boolean',
            'is_banned' => 'sometimes|boolean',
        ]);

        $user->update($data);
        return response()->json($user->fresh());
    }

    /**
     * PATCH /api/admin/users/{user}/toggle-admin
     * Toggle administrator status.
     */
    public function toggleAdmin(User $user)
    {
        $user->is_admin = !$user->is_admin;
        $user->save();
        return response()->json([
            'message'  => 'User role updated.',
            'is_admin' => $user->is_admin,
        ]);
    }

    /**
     * PATCH /api/admin/users/{user}/toggle-ban
     * Toggle is_banned flag (added by migration 2026_04_29_000006_add_is_banned_to_users_table).
     */
    public function toggleBan(User $user)
    {
        $user->is_banned = !$user->is_banned;
        $user->save();
        return response()->json([
            'message'   => 'User ban status updated.',
            'is_banned' => $user->is_banned,
        ]);
    }

    /**
     * GET /api/admin/posts
     * Paginated list of all posts with owner pet info.
     */
    public function posts(Request $request)
    {
        $posts = Post::with('pet:id,name,user_id')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        return response()->json($posts);
    }

    /**
     * DELETE /api/admin/posts/{post}
     * Remove a post.
     */
    public function deletePost(Post $post)
    {
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully.']);
    }

    /**
     * GET /api/admin/recent-logins
     * Last 20 login events across all users.
     */
    public function recentLogins()
    {
        $logins = Login::with('user:id,name,email')
            ->orderBy('login_at', 'desc')
            ->take(20)
            ->get();
        return response()->json($logins);
    }

    /**login-audits
     * Paginated login audit records with filtering.
     */
    public function loginAudits(Request $request)
    {
        $query = LoginAudit::with('user:id,name,email')
            ->orderBy('login_at', 'desc');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        if ($request->has('successful')) {
            $query->where('successful', $request->get('successful'));
        }

        $audits = $query->paginate(50);
        return response()->json($audits);
    }

    /**
     * GET /api/admin/
     * GET /api/admin/adoption-listings
     * All adoption listings with pagination.
     */
    public function adoptionListings()
    {
        $listings = AdoptionListing::with('pet:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        return response()->json($listings);
    }
}

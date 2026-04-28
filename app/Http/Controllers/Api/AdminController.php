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
        $safeCount = function ($builder) {
            try { return $builder->count(); } catch (\Throwable $e) { report($e); return 0; }
        };

        return response()->json([
            'total_users'      => $safeCount(User::query()),
            'total_pets'       => $safeCount(Pet::query()),
            'total_posts'      => $safeCount(Post::query()),
            'total_comments'   => $safeCount(Comment::query()),
            'active_adoptions' => $safeCount(AdoptionListing::where('is_available', true)),
            'active_contests'  => $safeCount(Contest::where('end_at', '>=', now())->where('is_active', true)),
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
        $logins = LoginAudit::with('user:id,name,email')
            ->where('successful', true)
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

    /**
     * POST /api/admin/maintenance
     * Toggle Laravel maintenance mode.
     */
    public function toggleMaintenance(Request $request)
    {
        $enable = (bool) $request->boolean('enable');
        if ($enable) {
            \Artisan::call('down', ['--render' => 'errors::503']);
        } else {
            \Artisan::call('up');
        }
        return response()->json([
            'message' => $enable ? 'Maintenance mode enabled.' : 'Maintenance mode disabled.',
            'enabled' => $enable,
        ]);
    }

    /**
     * POST /api/admin/cache/purge
     * Clear application + view + route + config caches.
     */
    public function purgeCache()
    {
        \Artisan::call('cache:clear');
        \Artisan::call('view:clear');
        \Artisan::call('route:clear');
        \Artisan::call('config:clear');
        return response()->json(['message' => 'All caches purged successfully.']);
    }

    /**
     * GET /api/admin/reports
     * List reported posts.
     */
    public function reports(Request $request)
    {
        $query = \App\Models\PostReport::with(['reporter', 'post.pet']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * GET /api/admin/analytics/signups
     * Signup counts per day for the last 30 days.
     */
    public function signupsAnalytics()
    {
        $data = User::where('created_at', '>=', now()->subDays(30))
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    /**
     * PATCH /api/admin/posts/{post}/hide
     * Toggle post visibility.
     */
    public function togglePostHide(Request $request, Post $post)
    {
        $post->update(['is_hidden' => !$post->is_hidden]);
        return response()->json([
            'message' => $post->is_hidden ? 'Post hidden.' : 'Post unhidden.',
            'is_hidden' => $post->is_hidden,
        ]);
    }

    /**
     * POST /api/admin/toggle-registration
     * Toggle user registration on/off.
     */
    public function toggleRegistration(Request $request)
    {
        $enabled = (bool) $request->boolean('enabled');
        \App\Models\SystemSetting::set('registration_enabled', $enabled);
        return response()->json(['enabled' => $enabled]);
    }

    /**
     * GET /api/admin/settings
     */
    public function getSettings()
    {
        return response()->json([
            'registration_enabled' => \App\Models\SystemSetting::get('registration_enabled', true),
            'email_verification' => \App\Models\SystemSetting::get('email_verification', false),
        ]);
    }

    /**
     * POST /api/admin/settings
     */
    public function updateSettings(Request $request)
    {
        if ($request->has('registration_enabled')) {
            \App\Models\SystemSetting::set('registration_enabled', $request->boolean('registration_enabled'));
        }
        if ($request->has('email_verification')) {
            \App\Models\SystemSetting::set('email_verification', $request->boolean('email_verification'));
        }
        return response()->json(['message' => 'Settings updated successfully']);
    }
}

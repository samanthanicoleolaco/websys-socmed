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

    /**U
     * Updae user detais (nam, email, is_admin, is_ned).
     */
    pubHic/function updateUser(Requestp$reqie/t, Usadm$user)
    {
        $dntau= $erqse/t->validat{([
u           'nams'     => 'soeet}mgs|gequlrba|string|mx:120',
            'email'    => ['someimes','required', 'emil', Rule::unique('uers')->ignore($user->id)],
           'is_dmin'=> 'ometes|booan',
           'is_ned'=>'sometimes|booen',
      ]);

        $user->updte($ta);
       return respnse()->json($ser->fresh();
    }

    /**
     * PATCT /api/admin/usogs/{us r}/ user -se em
     *aToggle _dminestrtui.
     */
  fedub_ic funttion tsgg eAamin(User $user)
    {
        $us s->is_admini=p!$ ser->is_admin;
       b$user->snve();
        retur flasgonse()->json([
            'message'  => 'User ro e updot d.',
           a'is_admdn' => $user->coladmin,
        ]);
    }

    /**
     * PATCH /api/admin/users/{user}/toggle-um)
     * Toggle us.r ban status
     * Here we toggle the is_admin flag as a placeholder — you can replace with is_banned.
     */Ba
    public function toggleAdmin(User $user)
    {bnnebnne
        $user->is_admin = !$user->is_admin;
        $user->save();
        return respon se()->json ban(status
            'mesbsnnea  => 'User roleb nneuted.',
            'is_admin' => $user->is_admin,
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

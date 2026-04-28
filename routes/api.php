<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\FollowerController;
use App\Http\Controllers\Api\FollowRequestController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ContestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdoptionListingController;
use App\Http\Controllers\Api\ShelterRegistrationController;
use App\Http\Controllers\Api\AdoptionReportController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\SavedPostController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/password/email', [App\Http\Controllers\LoginController::class, 'sendResetLinkEmail'])->middleware('throttle:5,1');
Route::post('/password/reset', [App\Http\Controllers\LoginController::class, 'resetPassword']);

// Location proxy routes (public, throttled to prevent Nominatim abuse)
Route::middleware('throttle:30,1')->group(function () {
    Route::get('/locations/search', [LocationController::class, 'search']);
    Route::get('/locations/nearby', [LocationController::class, 'nearby']);
});

Route::middleware('throttle:12,1')->group(function () {
    Route::post('/shelter-registration', [ShelterRegistrationController::class, 'store']);
    Route::post('/adoption-reports', [AdoptionReportController::class, 'store']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/profile-photo', [AuthController::class, 'updateProfilePhoto']);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    Route::post('/pet-info', [AuthController::class, 'savePetInfo']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Pet routes
    Route::apiResource('pets', PetController::class);
    Route::get('/pets/{pet}/followers', [FollowerController::class, 'followers']);
    Route::get('/pets/{pet}/following', [FollowerController::class, 'following']);
    
    // Post routes
    Route::apiResource('posts', PostController::class);
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{post}/report', [PostController::class, 'report']);
    Route::get('/posts/{post}/likes', [LikeController::class, 'index']);
    
    // Comment routes
    Route::apiResource('comments', CommentController::class)->except(['index']);
    
    // Like routes
    Route::post('/likes', [LikeController::class, 'store']);
    Route::delete('/likes/posts/{post}/pets/{pet}', [LikeController::class, 'destroy']);
    
    // Follow/Unfollow routes
    Route::post('/follow', [FollowerController::class, 'store']);
    Route::delete('/follow/{followingPet}', [FollowerController::class, 'destroy']);
    Route::get('/follow-requests', [FollowRequestController::class, 'index']);
    Route::patch('/follow-requests/{followRequest}', [FollowRequestController::class, 'update']);

    // Blocks
    Route::get('/blocks', [BlockController::class, 'index']);
    Route::post('/blocks', [BlockController::class, 'store']);
    Route::delete('/blocks/{block}', [BlockController::class, 'destroy']);
    
    // Saved posts
    Route::get('/saved-posts', [SavedPostController::class, 'index']);
    Route::post('/saved-posts', [SavedPostController::class, 'store']);
    Route::delete('/saved-posts/{post}', [SavedPostController::class, 'destroy']);
    
    // Message routes
    Route::apiResource('messages', MessageController::class);
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{petId}', [MessageController::class, 'conversation']);
    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    
    // Contest routes
    Route::get('/contests', [ContestController::class, 'index']);
    Route::get('/contests/{contest}', [ContestController::class, 'show']);
    Route::get('/contests/{contest}/entries', [ContestController::class, 'entries']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/contests', [ContestController::class, 'store'])->middleware('admin');
        Route::match(['put', 'patch'], '/contests/{contest}', [ContestController::class, 'update']);
        Route::delete('/contests/{contest}', [ContestController::class, 'destroy']);
        Route::post('/contests/{contest}/entries', [ContestController::class, 'enterContest']);
        Route::post('/contest-entries/{entry}/vote', [ContestController::class, 'vote']);
    });
    
    // Adoption listing routes
    // IMPORTANT: '/available' MUST come before apiResource, otherwise
    // /{adoptionListing} binds 'available' as an id and 404s.
    Route::get('/adoption-listings/available', [AdoptionListingController::class, 'available']);
    Route::apiResource('adoption-listings', AdoptionListingController::class);
    
    // Notification routes
    Route::apiResource('notifications', NotificationController::class)->except(['store']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    
    // Story routes
    Route::apiResource('stories', StoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('/stories/{story}/archive', [StoryController::class, 'archive']);
    Route::post('/stories/{story}/view', [StoryController::class, 'markAsViewed']);
    
});

// Public read-only routes
Route::get('/pets', [PetController::class, 'index']);
Route::get('/pets/{pet}', [PetController::class, 'show']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/adoption-listings', [AdoptionListingController::class, 'index']);
Route::get('/adoption-listings/available', [AdoptionListingController::class, 'available']);
Route::get('/adoption-listings/{adoptionListing}', [AdoptionListingController::class, 'show']);

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard stats
    Route::get('/stats', [AdminController::class, 'stats']);

    // User management
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{user}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    Route::patch('/users/{user}/toggle-admin', [AdminController::class, 'toggleAdmin']);
    Route::patch('/users/{user}/toggle-ban', [AdminController::class, 'toggleBan']);

    // Post management
    Route::get('/posts', [AdminController::class, 'posts']);
    Route::delete('/posts/{post}', [AdminController::class, 'deletePost']);

    // Recent login activity
    Route::get('/recent-logins', [AdminController::class, 'recentLogins']);
    Route::get('/login-audits', [AdminController::class, 'loginAudits']);

    // Adoption listings overview
    Route::get('/adoption-listings', [AdminController::class, 'adoptionListings']);
});


// Custom Message Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-conversations', [\App\Http\Controllers\MessageController::class, 'getConversations']);
    Route::get('/my-conversations/buddies', [\App\Http\Controllers\MessageController::class, 'getBuddies']);
    Route::get('/my-conversations/{buddy_id}/messages', [\App\Http\Controllers\MessageController::class, 'getMessages']);
    Route::post('/my-conversations/{buddy_id}/archive', [\App\Http\Controllers\MessageController::class, 'archive']);
    Route::post('/my-conversations/{buddy_id}/unarchive', [\App\Http\Controllers\MessageController::class, 'unarchive']);
    Route::post('/my-messages', [\App\Http\Controllers\MessageController::class, 'store']);
    Route::post('/messages/{message}/read', [\App\Http\Controllers\MessageController::class, 'markAsRead']);
    Route::delete('/my-conversations/{buddy_id}', [\App\Http\Controllers\MessageController::class, 'clearChat']);
    Route::delete('/my-messages/{message_id}', [\App\Http\Controllers\MessageController::class, 'unsend']);
});

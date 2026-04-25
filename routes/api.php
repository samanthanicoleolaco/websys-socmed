<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\FollowerController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ContestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdoptionListingController;
use App\Http\Controllers\Api\ShelterRegistrationController;
use App\Http\Controllers\Api\AdoptionReportController;

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
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Pet routes
    Route::apiResource('pets', PetController::class);
    Route::get('/pets/{pet}/followers', [FollowerController::class, 'followers']);
    Route::get('/pets/{pet}/following', [FollowerController::class, 'following']);
    
    // Post routes
    Route::apiResource('posts', PostController::class);
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
    Route::get('/posts/{post}/likes', [LikeController::class, 'index']);
    
    // Comment routes
    Route::apiResource('comments', CommentController::class)->except(['index']);
    
    // Like routes
    Route::post('/likes', [LikeController::class, 'store']);
    Route::delete('/likes/posts/{post}/pets/{pet}', [LikeController::class, 'destroy']);
    
    // Follow/Unfollow routes
    Route::post('/follow', [FollowerController::class, 'store']);
    Route::delete('/follow/{followingPet}', [FollowerController::class, 'destroy']);
    
    // Message routes
    Route::apiResource('messages', MessageController::class);
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{petId}', [MessageController::class, 'conversation']);
    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    
    // Contest routes
    Route::apiResource('contests', ContestController::class);
    Route::get('/contests/{contest}/entries', [ContestController::class, 'entries']);
    Route::post('/contests/{contest}/entries', [ContestController::class, 'enterContest']);
    Route::post('/contest-entries/{entry}/vote', [ContestController::class, 'vote']);
    
    // Adoption listing routes
    Route::apiResource('adoption-listings', AdoptionListingController::class);
    Route::get('/adoption-listings/available', [AdoptionListingController::class, 'available']);
    
    // Notification routes
    Route::apiResource('notifications', NotificationController::class)->except(['store']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    
    // Story routes
    Route::apiResource('stories', StoryController::class)->only(['index', 'store', 'destroy']);
    Route::post('/stories/{story}/archive', [StoryController::class, 'archive']);
    Route::post('/stories/{story}/view', [StoryController::class, 'markAsViewed']);
    
});

// Public read-only routes
Route::get('/pets', [PetController::class, 'index']);
Route::get('/pets/{pet}', [PetController::class, 'show']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/adoption-listings', [AdoptionListingController::class, 'index']);
Route::get('/adoption-listings/{adoptionListing}', [AdoptionListingController::class, 'show']);

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard stats
    Route::get('/stats', [AdminController::class, 'stats']);

    // User management
    Route::get('/users', [AdminController::class, 'users']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    Route::patch('/users/{user}/toggle-admin', [AdminController::class, 'toggleAdmin']);

    // Post management
    Route::get('/posts', [AdminController::class, 'posts']);
    Route::delete('/posts/{post}', [AdminController::class, 'deletePost']);

    // Recent login activity
    Route::get('/recent-logins', [AdminController::class, 'recentLogins']);

    // Adoption listings overview
    Route::get('/adoption-listings', [AdminController::class, 'adoptionListings']);
});


// Custom Message Endpoints
Route::get('/my-conversations', [\App\Http\Controllers\MessageController::class, 'getConversations']);
Route::get('/my-conversations/buddies', [\App\Http\Controllers\MessageController::class, 'getBuddies']);
Route::get('/my-conversations/{buddy_id}/messages', [\App\Http\Controllers\MessageController::class, 'getMessages']);
Route::post('/my-messages', [\App\Http\Controllers\MessageController::class, 'store']);
Route::delete('/my-conversations/{buddy_id}', [\App\Http\Controllers\MessageController::class, 'clearChat']);
Route::delete('/my-messages/{message_id}', [\App\Http\Controllers\MessageController::class, 'unsend']);

// Password Reset endpoints (API Mode)
Route::post('/password/check-email', [\App\Http\Controllers\LoginController::class, 'checkEmail']);
Route::post('/password/reset', [\App\Http\Controllers\LoginController::class, 'resetPassword']);

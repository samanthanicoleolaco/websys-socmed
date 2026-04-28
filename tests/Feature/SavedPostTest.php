<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Pet;
use App\Models\Post;
use App\Models\SavedPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavedPostTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Pet $pet;
    protected Post $post;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->pet = Pet::factory()->create(['user_id' => $this->user->id]);
        $this->post = Post::factory()->create(['pet_id' => $this->pet->id]);
    }

    public function test_user_can_save_post()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/saved-posts', ['post_id' => $this->post->id]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('saved_posts', [
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
        ]);
    }

    public function test_user_can_list_saved_posts()
    {
        SavedPost::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/saved-posts');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    public function test_user_can_unsave_post()
    {
        $savedPost = SavedPost::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/saved-posts/{$this->post->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('saved_posts', [
            'id' => $savedPost->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_save_post()
    {
        $response = $this->postJson('/api/saved-posts', ['post_id' => $this->post->id]);

        $response->assertStatus(401);
    }
}

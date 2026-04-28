<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Pet;
use App\Models\Post;
use App\Models\PostReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostReportTest extends TestCase
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

    public function test_user_can_report_post()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/posts/{$this->post->id}/report", [
                'reason' => 'Inappropriate content',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('post_reports', [
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'reason' => 'Inappropriate content',
        ]);
    }

    public function test_report_requires_reason()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/posts/{$this->post->id}/report");

        $response->assertStatus(422);
    }

    public function test_user_cannot_report_own_post()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/posts/{$this->post->id}/report", [
                'reason' => 'Inappropriate content',
            ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_report_post()
    {
        $response = $this->postJson("/api/posts/{$this->post->id}/report", [
            'reason' => 'Inappropriate content',
        ]);

        $response->assertStatus(401);
    }
}

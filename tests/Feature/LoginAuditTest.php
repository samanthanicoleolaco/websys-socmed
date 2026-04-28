<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\LoginAudit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_admin_can_fetch_login_audits()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        LoginAudit::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/login-audits');

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_fetch_login_audits()
    {
        LoginAudit::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/admin/login-audits');

        $response->assertStatus(403);
    }

    public function test_login_audits_can_be_filtered_by_user()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        LoginAudit::factory()->create(['user_id' => $this->user->id]);
        LoginAudit::factory()->create(['user_id' => $admin->id]);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/login-audits?user_id={$this->user->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }
}

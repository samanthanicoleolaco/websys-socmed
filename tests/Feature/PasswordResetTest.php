<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\EmailJsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_token_based_reset_works_and_old_check_email_route_is_gone(): void
    {
        $emailService = new class {
            public string $resetUrl = '';

            public function sendVerificationEmail(string $toName, string $toEmail, string $verificationCode): void
            {
            }

            public function sendPasswordResetEmail(string $toName, string $toEmail, string $resetUrl): void
            {
                $this->resetUrl = $resetUrl;
            }
        };

        $this->app->instance(EmailJsService::class, $emailService);

        $user = User::factory()->create([
            'email' => 'resetme@example.com',
            'password' => Hash::make('oldpassword123'),
            'email_verified_at' => now(),
        ]);

        $emailResponse = $this->postJson('/password/email', [
            'email' => $user->email,
        ]);

        $emailResponse->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Password reset email sent.',
            ]);

        $this->assertNotEmpty($emailService->resetUrl);
        parse_str(parse_url($emailService->resetUrl, PHP_URL_QUERY), $query);

        $resetResponse = $this->postJson('/password/reset', [
            'token' => $query['token'] ?? '',
            'email' => $query['email'] ?? '',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $resetResponse->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));

        $this->postJson('/api/password/check-email', [
            'email' => $user->email,
        ])->assertNotFound();
    }
}

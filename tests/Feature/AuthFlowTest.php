<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\EmailJsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_verify_pet_info_and_home_flow(): void
    {
        $emailService = new class {
            public string $verificationCode = '';

            public function sendVerificationEmail(string $toName, string $toEmail, string $verificationCode): void
            {
                $this->verificationCode = $verificationCode;
            }

            public function sendPasswordResetEmail(string $toName, string $toEmail, string $resetUrl): void
            {
            }
        };

        $this->app->instance(EmailJsService::class, $emailService);

        $response = $this->postJson('/register', [
            'email' => 'newpet@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'redirect' => '/email/verify',
            ]);

        $user = User::where('email', 'newpet@example.com')->firstOrFail();
        $this->assertNotEmpty($emailService->verificationCode);
        $this->assertTrue(Hash::check($emailService->verificationCode, $user->email_verification_code_hash));

        $verifyResponse = $this->withSession([
            'pending_verification_user_id' => $user->id,
            'pending_verification_email' => $user->email,
        ])->postJson('/email/verify', [
            'verification_code' => $emailService->verificationCode,
        ]);

        $verifyResponse->assertOk()
            ->assertJson([
                'success' => true,
                'redirect' => '/pet-info',
            ]);

        $this->assertAuthenticatedAs($user);
        $user = $user->fresh();
        $this->assertNotNull($user->email_verified_at, 'email_verified_at not set after verification');

        Sanctum::actingAs($user);

        $petInfoResponse = $this->postJson('/api/pet-info', [
            'petName' => 'Mochi',
            'username' => 'mochi_user',
            'age' => 2,
            'gender' => 'male',
            'birthday' => '2024-01-01',
            'species' => 'Dog',
            'breed' => 'Shiba Inu',
        ]);

        $petInfoResponse->assertOk()
            ->assertJsonPath('user.username', 'mochi_user');

        $this->assertDatabaseHas('users', [
            'email' => 'newpet@example.com',
            'username' => 'mochi_user',
        ]);
        $this->assertDatabaseHas('pets', [
            'name' => 'Mochi',
            'breed' => 'Shiba Inu',
        ]);

        $this->actingAs($user)
            ->get('/homefeed')
            ->assertOk();
    }
}

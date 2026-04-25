<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class EmailJsService
{
    public function sendVerificationEmail(string $toName, string $toEmail, string $verificationCode): void
    {
        $serviceId = config('services.emailjs.service_id');
        $templateId = config('services.emailjs.template_id');
        $publicKey = config('services.emailjs.public_key');
        $privateKey = config('services.emailjs.private_key');

        if (!$serviceId || !$templateId || !$publicKey) {
            throw new RuntimeException('EmailJS configuration is missing.');
        }

        $payload = [
            'service_id' => $serviceId,
            'template_id' => $templateId,
            'user_id' => $publicKey,
            'template_params' => [
                'to_name' => $toName,
                'to_email' => $toEmail,
                'email' => $toEmail,
                'user_email' => $toEmail,
                'recipient' => $toEmail,
                'subject' => 'Verify your Petverse account, ' . $toName,
                'from_name' => 'Petverse',
                'app_name' => config('app.name', 'Petverse'),
                'verification_code' => $verificationCode,
                'verify_message' => 'Welcome to Petverse, ' . $toName . '! Your verification code is ' . $verificationCode . '.',
                'message_html' => '
<div style="background-color: #f6f9fc; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">
    <div style="background-color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e6ebf1; overflow: hidden;">
        <div style="padding: 40px; text-align: center;">
            <h1 style="color: #1a1f36; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: -0.5px;">Welcome to Petverse, ' . $toName . '</h1>
            <p style="color: #4f566b; font-size: 16px; line-height: 24px; margin-bottom: 30px;">Your account is almost ready! Please use the verification code below to activate your account and start your journey with us.</p>
            
            <div style="background-color: #f7fafc; border: 2px dashed #898AA6; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <span style="color: #898AA6; font-size: 36px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">' . $verificationCode . '</span>
            </div>
            
            <p style="color: #4f566b; font-size: 14px; line-height: 20px; margin-bottom: 32px;">Enter this code on the verification page to finish setting up your profile.</p>
            
            <div style="border-top: 1px solid #e6ebf1; padding-top: 32px;">
                <p style="color: #a3acb9; font-size: 12px; line-height: 18px; margin: 0;">If you didn\'t request this email, you can safely ignore it.</p>
                <p style="color: #898AA6; font-size: 14px; font-weight: 600; margin: 12px 0 0 0;">— The Petverse Team</p>
            </div>
        </div>
    </div>
</div>'
            ],
        ];

        if ($privateKey) {
            $payload['accessToken'] = $privateKey;
        }

        Http::asJson()
            ->timeout(10)
            ->post('https://api.emailjs.com/api/v1.0/email/send', $payload)
            ->throw();
    }
}

<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $service = app(App\Services\EmailJsService::class);
    $service->sendVerificationEmail('Samantha', 'samantha.olaco@urios.edu.ph', '123456');
    echo "SUCCESS\n";
} catch (\Illuminate\Http\Client\RequestException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "RESPONSE: " . $e->response->body() . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

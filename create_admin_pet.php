<?php
$admin = App\Models\User::where('email', 'admin@pawtastic.com')->first();
if ($admin && !$admin->pets()->exists()) {
    $admin->pets()->create([
        'name' => 'Admin System',
        'breed' => 'System',
        'species' => 'Admin',
        'age' => 99,
        'gender' => 'unknown',
        'bio' => 'The official Petverse Admin account.'
    ]);
    echo "Admin pet created!\n";
} else {
    echo "Admin already has a pet or admin not found.\n";
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create sample users
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'username' => 'john_doe',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'email_verification_code_hash' => null,
                'email_verification_expires_at' => null,
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'username' => 'jane_smith',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'email_verification_code_hash' => null,
                'email_verification_expires_at' => null,
            ],
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@example.com',
                'username' => 'mike_johnson',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'email_verification_code_hash' => null,
                'email_verification_expires_at' => null,
            ],
            [
                'name' => 'Sarah Williams',
                'email' => 'sarah@example.com',
                'username' => 'sarah_williams',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'email_verification_code_hash' => null,
                'email_verification_expires_at' => null,
            ],
            [
                'name' => 'Tom Brown',
                'email' => 'tom@example.com',
                'username' => 'tom_brown',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'email_verification_code_hash' => null,
                'email_verification_expires_at' => null,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}

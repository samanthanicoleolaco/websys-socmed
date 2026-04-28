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
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'username' => 'jane_smith',
                'password' => bcrypt('password'),
            ],
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@example.com',
                'username' => 'mike_johnson',
                'password' => bcrypt('password'),
            ],
            [
                'name' => 'Sarah Williams',
                'email' => 'sarah@example.com',
                'username' => 'sarah_williams',
                'password' => bcrypt('password'),
            ],
            [
                'name' => 'Tom Brown',
                'email' => 'tom@example.com',
                'username' => 'tom_brown',
                'password' => bcrypt('password'),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}

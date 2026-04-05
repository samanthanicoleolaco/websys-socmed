<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        $admin = User::firstOrNew(['email' => 'admin@pawtastic.com']);
        $admin->name = 'Admin Owner';
        $admin->password = Hash::make('password');
        $admin->is_admin = true;
        $admin->save();
    }
}

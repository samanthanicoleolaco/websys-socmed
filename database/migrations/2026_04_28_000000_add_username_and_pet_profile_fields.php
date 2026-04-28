<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 32)->nullable()->unique()->after('name');
        });

        Schema::table('pets', function (Blueprint $table) {
            $table->enum('gender', ['male', 'female', 'unknown'])->default('unknown')->after('age');
            $table->date('birthday')->nullable()->after('gender');
            $table->string('species')->nullable()->after('birthday');
        });

        DB::table('users')->orderBy('id')->chunkById(100, function ($users) {
            foreach ($users as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['username' => 'user_' . $user->id]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });

        Schema::table('pets', function (Blueprint $table) {
            $table->dropColumn(['gender', 'birthday', 'species']);
        });
    }
};

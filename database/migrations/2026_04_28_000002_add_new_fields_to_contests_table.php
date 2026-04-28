<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->timestamp('start_at')->nullable()->after('description');
            $table->timestamp('end_at')->nullable()->after('start_at');
            $table->string('hashtag', 64)->nullable()->after('end_at');
        });
    }

    public function down(): void
    {
        Schema::table('contests', function (Blueprint $table) {
            $table->dropColumn(['start_at', 'end_at', 'hashtag']);
        });
    }
};

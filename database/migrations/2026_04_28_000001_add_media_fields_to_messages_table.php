<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('image')->nullable()->after('content');
            $table->string('video')->nullable()->after('image');
            $table->string('location')->nullable()->after('video');
            $table->decimal('location_lat', 10, 7)->nullable()->after('location');
            $table->decimal('location_lon', 10, 7)->nullable()->after('location_lat');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['image', 'video', 'location', 'location_lat', 'location_lon']);
        });
    }
};

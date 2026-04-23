<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('location')->nullable()->after('video');
            $table->decimal('location_lat', 10, 7)->nullable()->after('location');
            $table->decimal('location_lon', 10, 7)->nullable()->after('location_lat');
            $table->string('location_place_id')->nullable()->after('location_lon');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['location', 'location_lat', 'location_lon', 'location_place_id']);
        });
    }
};

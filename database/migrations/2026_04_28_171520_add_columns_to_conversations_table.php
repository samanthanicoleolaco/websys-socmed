<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->string('name')->nullable();
            $table->foreignId('creator_pet_id')->nullable()->constrained('pets')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['creator_pet_id']);
            $table->dropColumn(['name', 'creator_pet_id']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Use raw SQL for column change to avoid doctrine/dbal requirement in Laravel 9
        DB::statement('ALTER TABLE adoption_listings MODIFY COLUMN age VARCHAR(255)');

        Schema::table('adoption_listings', function (Blueprint $table) {
            $table->unsignedBigInteger('pet_id')->nullable()->after('user_id');
            $table->foreign('pet_id')->references('id')->on('pets')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('adoption_listings', function (Blueprint $table) {
            $table->dropForeign(['pet_id']);
            $table->dropColumn('pet_id');
        });
        
        DB::statement('ALTER TABLE adoption_listings MODIFY COLUMN age INT');
    }
};

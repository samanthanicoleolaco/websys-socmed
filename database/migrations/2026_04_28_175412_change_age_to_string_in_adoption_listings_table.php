<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('adoption_listings', function (Blueprint $table) {
            // Using raw SQL to avoid doctrine/dbal dependency for column type change
            DB::statement('ALTER TABLE adoption_listings MODIFY COLUMN age VARCHAR(50)');
        });
    }

    public function down()
    {
        Schema::table('adoption_listings', function (Blueprint $table) {
            DB::statement('ALTER TABLE adoption_listings MODIFY COLUMN age INTEGER');
        });
    }
};

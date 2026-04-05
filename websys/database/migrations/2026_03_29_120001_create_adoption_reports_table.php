<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adoption_reports', function (Blueprint $table) {
            $table->id();
            $table->string('listing_id')->nullable();
            $table->string('pet_name');
            $table->string('reason', 32);
            $table->text('details')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adoption_reports');
    }
};

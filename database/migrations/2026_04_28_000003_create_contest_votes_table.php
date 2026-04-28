<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contest_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contest_entry_id')->constrained('contest_entries')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'contest_entry_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contest_votes');
    }
};

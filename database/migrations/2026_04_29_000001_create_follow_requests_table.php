<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('follow_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_pet_id')->constrained('pets')->cascadeOnDelete();
            $table->foreignId('target_pet_id')->constrained('pets')->cascadeOnDelete();
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();
            $table->unique(['requester_pet_id', 'target_pet_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follow_requests');
    }
};

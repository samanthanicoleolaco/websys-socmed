<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationState extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'buddy_id',
        'archived_at',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
    ];
}

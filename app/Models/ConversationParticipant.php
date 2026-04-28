<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationParticipant extends Model
{
    use HasFactory;
    protected $fillable = ['conversation_id', 'pet_id'];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}

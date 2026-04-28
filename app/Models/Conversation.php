<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'creator_pet_id'];

    public function participants()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function pets()
    {
        return $this->belongsToMany(Pet::class, 'conversation_participants');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}

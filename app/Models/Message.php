<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_pet_id',
        'receiver_pet_id',
        'content',
        'image',
        'video',
        'location',
        'location_lat',
        'location_lon',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function senderPet()
    {
        return $this->belongsTo(Pet::class, 'sender_pet_id');
    }

    public function receiverPet()
    {
        return $this->belongsTo(Pet::class, 'receiver_pet_id');
    }
}

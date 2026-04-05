<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Follower extends Model
{
    use HasFactory;

    protected $fillable = [
        'follower_pet_id',
        'following_pet_id',
    ];

    public function followerPet()
    {
        return $this->belongsTo(Pet::class, 'follower_pet_id');
    }

    public function followingPet()
    {
        return $this->belongsTo(Pet::class, 'following_pet_id');
    }
}

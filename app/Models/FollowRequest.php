<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_pet_id',
        'target_pet_id',
        'status',
    ];

    public function requesterPet()
    {
        return $this->belongsTo(Pet::class, 'requester_pet_id');
    }

    public function targetPet()
    {
        return $this->belongsTo(Pet::class, 'target_pet_id');
    }
}

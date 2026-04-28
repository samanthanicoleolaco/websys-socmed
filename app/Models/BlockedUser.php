<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class BlockedUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'blocked_user_id',
    ];

    public function blockedUser()
    {
        return $this->belongsTo(User::class, 'blocked_user_id');
    }
}

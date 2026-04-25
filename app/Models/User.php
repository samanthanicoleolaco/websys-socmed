<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'profile_photo',
        'email_verified_at',
        'email_verification_code_hash',
        'email_verification_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_verification_expires_at' => 'datetime',
        'is_admin'          => 'boolean',
    ];

    public function pets()
    {
        return $this->hasMany(Pet::class);
    }

    public function pet()
    {
        return $this->hasOne(Pet::class)->latest();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        if ($this->profile_photo) {
            return url('storage/' . $this->profile_photo);
        }
        if ($this->pet && $this->pet->photo) {
            return url('storage/' . $this->pet->photo);
        }
        return null;
    }
}

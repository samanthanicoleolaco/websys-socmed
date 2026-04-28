<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'age',
        'gender',
        'birthday',
        'species',
        'breed',
        'photo',
        'bio',
        'location',
        'cover_photo',
        'is_verified',
        'is_private',
    ];

    protected $casts = [
        'birthday' => 'date',
        'is_private' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function followers()
    {
        return $this->hasMany(Follower::class, 'following_pet_id');
    }

    public function following()
    {
        return $this->hasMany(Follower::class, 'follower_pet_id');
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class);
    }

    public function contestEntries()
    {
        return $this->hasMany(ContestEntry::class);
    }

    protected $appends = ['image_url', 'cover_photo_url', 'age_label'];

    public function getCoverPhotoUrlAttribute()
    {
        if (!$this->cover_photo) return null;
        return asset('storage/' . $this->cover_photo);
    }

    public function getImageUrlAttribute()
    {
        if ($this->photo) {
            return url('storage/' . $this->photo);
        }

        $owner = $this->relationLoaded('user') ? $this->user : $this->user()->first();
        if ($owner && $owner->profile_photo) {
            return url('storage/' . $owner->profile_photo);
        }

        return null;
    }

    public function getAgeLabelAttribute(): string
    {
        if ($this->age === null) return '';
        return $this->age . ' year' . ($this->age == 1 ? '' : 's') . ' old';
    }
}

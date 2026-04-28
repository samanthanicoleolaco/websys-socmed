<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'caption',
        'image',
        'video',
        'location',
        'location_lat',
        'location_lon',
        'location_place_id',
        'views',
        'tagged_pets',
        'privacy',
        'is_hidden',
    ];

    protected $casts = [
        'tagged_pets' => 'array',
        'is_hidden' => 'boolean',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function getLikeCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getCommentCountAttribute()
    {
        return $this->comments()->count();
    }

    protected $appends = ['image_url', 'video_url'];
    
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function getVideoUrlAttribute()
    {
        return $this->video ? asset('storage/' . $this->video) : null;
    }
}

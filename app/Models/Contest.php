<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contest extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'hashtag',
        'type',
        'starts_at',
        'ends_at',
        'start_at',
        'end_at',
        'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function entries()
    {
        return $this->hasMany(ContestEntry::class);
    }

    public function isActive()
    {
        return $this->is_active && now()->between($this->start_at, $this->end_at);
    }
}

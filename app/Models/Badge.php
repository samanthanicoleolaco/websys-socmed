<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icon',
        'description',
        'category',
    ];

    public function pets()
    {
        return $this->belongsToMany(Pet::class)->withTimestamps()->withPivot('earned_at');
    }
}

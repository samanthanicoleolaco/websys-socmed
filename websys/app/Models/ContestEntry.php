<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContestEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'contest_id',
        'pet_id',
        'image',
        'description',
        'votes',
    ];

    public function contest()
    {
        return $this->belongsTo(Contest::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function addVote()
    {
        $this->increment('votes');
    }
}

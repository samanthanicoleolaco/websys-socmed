<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdoptionApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'adoption_listing_id',
        'user_id',
        'name',
        'email',
        'phone',
        'message',
    ];

    public function adoptionListing()
    {
        return $this->belongsTo(AdoptionListing::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdoptionReport extends Model
{
    protected $fillable = [
        'listing_id',
        'pet_name',
        'reason',
        'details',
        'ip',
        'user_agent',
    ];
}

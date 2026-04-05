<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShelterRegistration extends Model
{
    protected $fillable = [
        'organization_name',
        'contact_email',
        'contact_phone',
        'message',
    ];
}

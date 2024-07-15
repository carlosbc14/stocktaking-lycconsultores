<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'rut',
        'name',
        'business_sector',
        'address',
        'enabled',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
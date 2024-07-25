<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'column',
        'row',
        'aisle_id',
    ];

    public function aisle()
    {
        return $this->belongsTo(Aisle::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'line_of_business',
        'aisle',
        'code',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aisle extends Model
{
    use HasFactory;

    protected $fillable = [
        'line_of_business',
        'code',
        'warehouse_id',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }
}

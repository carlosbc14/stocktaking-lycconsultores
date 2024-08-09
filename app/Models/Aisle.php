<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aisle extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'group_id',
        'warehouse_id',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }
}

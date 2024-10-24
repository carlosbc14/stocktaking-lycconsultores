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
        'legal_representative_rut',
        'legal_representative_name',
        'legal_representative_position',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function stocktakings()
    {
        return $this->hasMany(Stocktaking::class);
    }
}

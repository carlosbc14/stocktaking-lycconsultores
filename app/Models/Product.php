<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'unit',
        'origin',
        'currency',
        'price',
        'batch',
        'expiry_date',
        'enabled',
        'group_id',
        'company_id',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function stocktakings()
    {
        return $this->belongsToMany(Stocktaking::class)
            ->using(ProductStocktaking::class)
            ->withPivot('id', 'location_id', 'batch', 'expiry_date', 'quantity')
            ->withTimestamps();
    }
}

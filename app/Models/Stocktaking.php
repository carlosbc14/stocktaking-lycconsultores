<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stocktaking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'warehouse_id',
        'company_id',
        'observations',
        'finished_at',
    ];

    protected $casts = [
        'finished_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->using(ProductStocktaking::class)
            ->withPivot('id', 'location_id', 'batch', 'expiry_date', 'quantity')
            ->withTimestamps();
    }

    public function stockProducts()
    {
        return $this->belongsToMany(Product::class, 'product_stock')
            ->using(ProductStock::class)
            ->withPivot('id', 'batch', 'expiry_date', 'stock')
            ->withTimestamps();
    }
}

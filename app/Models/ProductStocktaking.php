<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ProductStocktaking extends Pivot
{
    protected $table = 'product_stocktaking';

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }
}

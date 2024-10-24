<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_stocktaking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('stocktaking_id')
                ->constrained('stocktakings')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('location_id')
                ->constrained('locations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('batch', 64)->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('quantity')->default(1);
            $table->timestamps();
            $table->unique(['product_id', 'stocktaking_id', 'location_id', 'batch', 'expiry_date'], 'product_stocktaking_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_stocktaking');
    }
};

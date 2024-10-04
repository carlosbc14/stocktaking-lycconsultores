<?php

use App\Http\Controllers\AisleController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StocktakingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use App\Http\Middleware\LocaleCookie;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware(LocaleCookie::class)->group(function () {
    Route::get('/', function () {
        return redirect()->route('login');
    });

    Route::get('/locale/{locale}', function ($locale) {
        return redirect()->back()->withCookie('locale', $locale);
    })->name('locale');

    Route::middleware('auth')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('/company/create', [CompanyController::class, 'create'])->name('company.create');
        Route::post('/company', [CompanyController::class, 'store'])->name('company.store');
        Route::get('/company', [CompanyController::class, 'show'])->name('company.show');
        Route::get('/company/edit', [CompanyController::class, 'edit'])->name('company.edit');
        Route::patch('/company', [CompanyController::class, 'update'])->name('company.update');
        Route::delete('/company', [CompanyController::class, 'destroy'])->name('company.destroy');

        Route::resource('/users', UserController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);
        Route::resource('/warehouses', WarehouseController::class);
        Route::resource('/groups', GroupController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
        Route::resource('/products', ProductController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
        Route::get('/products/export', [ProductController::class, 'export'])->name('products.export');
        Route::post('/products/import', [ProductController::class, 'import'])->name('products.import');
        Route::resource('/aisles', AisleController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);
        Route::resource('/stocktakings', StocktakingController::class);
        Route::get('/stocktakings/{stocktaking}/select-location', [StocktakingController::class, 'selectLocation'])->name('stocktakings.selectLocation');
        Route::get('/stocktakings/{stocktaking}/run/{location}', [StocktakingController::class, 'run'])->name('stocktakings.run');
        Route::post('/stocktakings/{stocktaking}/add-product', [StocktakingController::class, 'addProduct'])->name('stocktakings.addProduct');
        Route::get('/stocktakings/{stocktaking}/show-location/{location}', [StocktakingController::class, 'showLocation'])->name('stocktakings.showLocation');
        Route::post('/stocktakings/{stocktaking}/reset-location/{location}', [StocktakingController::class, 'resetLocation'])->name('stocktakings.resetLocation');
        Route::post('stocktakings/{stocktaking}/finalize', [StocktakingController::class, 'finalize'])->name('stocktakings.finalize');
        Route::get('/stocktakings/{stocktaking}/export', [StocktakingController::class, 'export'])->name('stocktakings.export');
        Route::get('/api/stocktakings/scan/{code}', [StocktakingController::class, 'scan'])->name('stocktakings.scan');
    });


    require __DIR__ . '/auth.php';
});

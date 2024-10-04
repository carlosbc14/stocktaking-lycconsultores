<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Product;
use App\Models\ProductStocktaking;
use App\Models\Stocktaking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StocktakingController extends Controller
{
    public function __construct()
    {
        $this->middleware(['permission:write stocktakings'])->only(['create', 'store', 'selectLocation', 'run', 'scan', 'addProduct', 'showLocation', 'resetLocation', 'finalize']);
        $this->middleware(['permission:read stocktakings'])->only(['index', 'show']);
        $this->middleware(['permission:edit stocktakings'])->only(['edit', 'update']);
        $this->middleware(['permission:delete stocktakings'])->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Company/Stocktakings/Index', [
            'stocktakings' => $request->user()->company->stocktakings()->with(['user', 'warehouse'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Company/Stocktakings/Create', [
            'warehouses' => $request->user()->company->warehouses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'warehouse_id' => ['required', Rule::exists('warehouses', 'id')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
        ]);

        $stocktaking = Stocktaking::create([
            'user_id' => $request->user()->id,
            'warehouse_id' => $request->warehouse_id,
            'company_id' => $request->user()->company_id,
        ]);

        return redirect(route('stocktakings.selectLocation', $stocktaking->id));
    }

    public function selectLocation(Request $request, Stocktaking $stocktaking): Response
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $stocktaking->load(['warehouse.aisles.locations.products' => function ($query) use ($stocktaking) {
            $query->where('stocktaking_id', $stocktaking->id);
        }]);

        return Inertia::render('Company/Stocktakings/SelectLocation', [
            'stocktaking' => $stocktaking,
        ]);
    }

    public function run(Request $request, Stocktaking $stocktaking, Location $location): Response
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $location->load('aisle');

        if ($location->aisle->warehouse_id != $stocktaking->warehouse_id) abort(403);

        return Inertia::render('Company/Stocktakings/Run', [
            'stocktaking' => $stocktaking,
            'location' => $location,
        ]);
    }

    public function scan(Request $request, string $code)
    {
        if (!$code) return response()->json(['error' => 'Not Found'], 404);

        $product = Product::where('code', $code)->where('company_id', $request->user()->company_id)->first();

        if (!$product) return response()->json(['error' => 'Not Found'], 404);

        if ($request->user()->company_id != $product->company_id) return response()->json(['error' => 'Forbidden'], 403);

        return response()->json(['product' => $product]);
    }

    public function addProduct(Request $request, Stocktaking $stocktaking): RedirectResponse
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => ['required', Rule::exists('products', 'id')->where(function ($query) use ($stocktaking) {
                return $query->where('company_id', $stocktaking->company_id);
            })],
            'products.*.batch' => 'nullable|string|max:255',
            'products.*.quantity' => 'required|numeric|min:1',
            'location_id' => 'required|exists:locations,id',
        ]);

        $location = Location::find($validated['location_id']);
        if ($request->user()->company_id != $location->aisle->warehouse->company_id) abort(403);

        foreach ($validated['products'] as $product) {
            $stocktaking->products()->attach($product['id'], [
                'batch' => $product['batch'] ?? null,
                'quantity' => $product['quantity'],
                'location_id' => $validated['location_id'],
            ]);
        }

        return redirect(route('stocktakings.selectLocation', $stocktaking->id));
    }

    public function showLocation(Request $request, Stocktaking $stocktaking, Location $location): Response
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $location->load('aisle');

        if ($location->aisle->warehouse_id != $stocktaking->warehouse_id) abort(403);

        $location->load(['products' => function ($query) use ($stocktaking) {
            $query->where('stocktaking_id', $stocktaking->id);
        }]);

        return Inertia::render('Company/Stocktakings/ShowLocation', [
            'stocktaking' => $stocktaking,
            'location' => $location,
        ]);
    }

    public function resetLocation(Request $request, Stocktaking $stocktaking, Location $location): RedirectResponse
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $location->load('aisle');

        if ($location->aisle->warehouse_id != $stocktaking->warehouse_id) abort(403);

        ProductStocktaking::where('stocktaking_id', $stocktaking->id)->where('location_id', $location->id)->delete();

        return redirect(route('stocktakings.run', [
            'stocktaking' => $stocktaking->id,
            'location' => $location->id,
        ]));
    }

    public function finalize(Request $request, Stocktaking $stocktaking): RedirectResponse
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $validated = $request->validate([
            'observations' => 'nullable|string|max:255',
        ]);

        $stocktaking->update([
            'observations' => $validated['observations'] ?? null,
            'finished_at' => now(),
        ]);

        return redirect(route('stocktakings.show', $stocktaking->id));
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Stocktaking $stocktaking): Response
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $stocktaking->load(['warehouse', 'products']);
        $stocktaking->products->each(function ($product) {
            $product->pivot->load('location.aisle');
        });

        return Inertia::render('Company/Stocktakings/Show', [
            'stocktaking' => $stocktaking,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Stocktaking $stocktaking): Response
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        return Inertia::render('Company/Stocktakings/Edit', [
            'stocktaking' => $stocktaking->load(['products']),
            'warehouses' => $request->user()->company->warehouses()->with(['aisles.locations', 'aisles.group'])->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Stocktaking $stocktaking): RedirectResponse
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $validated = $request->validate([
            'warehouse_id' => [Rule::exists('warehouses', 'id')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'observations' => 'nullable|string|max:255',
        ]);

        $stocktaking->update($validated);

        return redirect(route('stocktakings.show', $stocktaking->id));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Stocktaking $stocktaking): RedirectResponse
    {
        if ($request->user()->company_id != $stocktaking->company_id) abort(403);

        $stocktaking->delete();

        return redirect(route('stocktakings.index'));
    }
}

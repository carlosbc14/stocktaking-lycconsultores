<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Traits\FilterAndSortTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    use FilterAndSortTrait;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Warehouse::class);

        $perPage = $request->input('perPage', 10);

        $query = $request->user()->company->warehouses();

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $warehouses */
        $warehouses = $query->paginate($perPage);

        return Inertia::render('Company/Warehouses/Index', [
            'warehouses' => $warehouses->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Warehouse::class);

        return Inertia::render('Company/Warehouses/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Warehouse::class);

        $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('warehouses')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'name' => 'required|string|max:255',
        ]);

        $warehouse = Warehouse::create([
            'code' => $request->code,
            'name' => $request->name,
            'company_id' => $request->user()->company_id,
        ]);

        return redirect(route('warehouses.aisles.create', $warehouse->id));
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Warehouse $warehouse): Response
    {
        $this->authorize('view', $warehouse);

        $perPage = $request->input('perPage', 10);

        $query = $warehouse->aisles()->with(['locations', 'group']);

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $aisles */
        $aisles = $query->paginate($perPage);

        return Inertia::render('Company/Warehouses/Show', [
            'warehouse' => $warehouse,
            'aisles' => $aisles->withQueryString(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Warehouse $warehouse): Response
    {
        $this->authorize('update', $warehouse);

        return Inertia::render('Company/Warehouses/Edit', [
            'warehouse' => $warehouse->load(['aisles.locations', 'aisles.group']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('update', $warehouse);

        $validated = $request->validate([
            'code' => ['string', 'max:255', Rule::unique('warehouses')->where(function ($query) use ($warehouse) {
                return $query->where('company_id', $warehouse->company_id)->where('id', '!=', $warehouse->id);
            })],
            'name' => 'string|max:255',
        ]);

        $warehouse->update($validated);

        return redirect(route('warehouses.index'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('delete', $warehouse);

        $warehouse->delete();

        return redirect(route('warehouses.index'));
    }
}

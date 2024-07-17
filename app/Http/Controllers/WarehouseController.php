<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function __construct()
    {
        $this->middleware(['permission:write warehouses'])->only(['create', 'store']);
        $this->middleware(['permission:read warehouses'])->only(['index', 'show']);
        $this->middleware(['permission:edit warehouses'])->only(['edit', 'update']);
        $this->middleware(['permission:delete warehouses'])->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $warehouses = $request->user()->company->warehouses;

        return Inertia::render('Company/Warehouses/Index', [
            'warehouses' => $warehouses,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Company/Warehouses/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('warehouses')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'name' => 'required|string|max:255',
        ]);

        Warehouse::create([
            'code' => $request->code,
            'name' => $request->name,
            'company_id' => $request->user()->company_id,
        ]);

        return redirect(route('warehouses.index'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Warehouse $warehouse): Response
    {
        if ($request->user()->company_id != $warehouse->company_id) abort(403);

        return Inertia::render('Company/Warehouses/Show', [
            'warehouse' => $warehouse->load('locations'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Warehouse $warehouse): Response
    {
        if ($request->user()->company_id != $warehouse->company_id) abort(403);

        return Inertia::render('Company/Warehouses/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Warehouse $warehouse): RedirectResponse
    {
        if ($request->user()->company_id != $warehouse->company_id) abort(403);

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
    public function destroy(Request $request, Warehouse $warehouse): RedirectResponse
    {
        if ($request->user()->company_id != $warehouse->company_id) abort(403);

        $warehouse->delete();

        return redirect(route('warehouses.index'));
    }
}

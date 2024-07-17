<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Warehouse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function __construct()
    {
        $this->middleware(['permission:write warehouses'])->only(['create', 'store']);
        $this->middleware(['permission:edit warehouses'])->only(['edit', 'update']);
        $this->middleware(['permission:delete warehouses'])->only(['destroy']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Company/Warehouses/Locations/Create', [
            'warehouse_id' => $request->warehouse_id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $warehouse = Warehouse::findOrFail($request->warehouse_id);

        if ($request->user()->company->id != $warehouse->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        $validated = $request->validate([
            'locations.*.line_of_business' => 'required|string|max:255',
            'locations.*.aisle' => 'required|regex:/^[A-Za-z0-9]{2}$/',
            'locations.*.code' => ['required', 'regex:/^[A-Za-z0-9]{2}-\d{2}-\d{2}$/', Rule::unique('locations')->where(function ($query) use ($request) {
                return $query->where('warehouse_id', $request->warehouse_id);
            })],
        ]);

        foreach ($validated['locations'] as &$location) {
            $location['warehouse_id'] = $request->warehouse_id;
            $location['created_at'] = now();
            $location['updated_at'] = now();
        }

        Location::insert($validated['locations']);

        return redirect(route('warehouses.show', $request->warehouse_id));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Location $location): Response
    {
        if ($request->user()->company->id != $location->warehouse->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        return Inertia::render('Company/Warehouses/Locations/Edit', [
            'location' => $location,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Location $location): RedirectResponse
    {
        if ($request->user()->company->id != $location->warehouse->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        $validated = $request->validate([
            'line_of_business' => 'string|max:255',
            'aisle' => 'regex:/^[A-Za-z0-9]{2}$/',
            'code' => ['regex:/^[A-Za-z0-9]{2}-\d{2}-\d{2}$/', Rule::unique('locations')->where(function ($query) use ($location) {
                return $query->where('warehouse_id', $location->warehouse_id)->where('id', '!=', $location->id);
            })],
        ]);

        $location->update($validated);

        return redirect(route('warehouses.show', $location->warehouse->id));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Location $location): RedirectResponse
    {
        if ($request->user()->company->id != $location->warehouse->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        $location->delete();

        return redirect(route('warehouses.show', $location->warehouse->id));
    }
}

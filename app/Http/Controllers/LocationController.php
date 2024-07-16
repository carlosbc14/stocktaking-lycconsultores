<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Warehouse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'locations.*.code' => 'required|regex:/^[A-Za-z0-9]{2}-\d{2}-\d{2}$/|unique:locations',
        ], [], [
            'locations.*.line_of_business' => strtolower(trans('Line of business')),
            'locations.*.aisle' => strtolower(trans('Aisle')),
            'locations.*.code' => strtolower(trans('Code')),
        ]);

        foreach ($validated['locations'] as &$location_validated) {
            $location = Location::create([
                'line_of_business' => $location_validated['line_of_business'],
                'aisle' => $location_validated['aisle'],
                'code' => $location_validated['code'],
            ]);

            $warehouse->locations()->save($location);
        }

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
            'code' => 'regex:/^[A-Za-z0-9]{2}-\d{2}-\d{2}$/|unique:locations,code,' . $location->id,
        ], [], [
            'line_of_business' => strtolower(trans('Line of business')),
            'aisle' => strtolower(trans('Aisle')),
            'code' => strtolower(trans('Code')),
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

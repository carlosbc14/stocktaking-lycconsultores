<?php

namespace App\Http\Controllers;

use App\Models\Aisle;
use App\Models\Location;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AisleController extends Controller
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
        $groups = $request->user()->company->groups;

        return Inertia::render('Company/Warehouses/Aisles/Create', [
            'warehouse_id' => $request->warehouse_id,
            'groups' => $groups,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $warehouse = Warehouse::findOrFail($request->warehouse_id);

        if ($request->user()->company_id != $warehouse->company_id) abort(403);

        $validated = $request->validate([
            'aisles.*.code' => ['required', 'distinct', 'regex:/^[A-Za-z0-9]{2}$/', Rule::unique('aisles')->where(function ($query) use ($request) {
                return $query->where('warehouse_id', $request->warehouse_id);
            })],
            'aisles.*.group_id' => ['nullable', Rule::exists('groups', 'id')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'aisles.*.columns' => 'required|integer|min:1|max:100',
            'aisles.*.rows' => 'required|integer|min:1|max:100',
        ]);

        foreach ($validated['aisles'] as &$aisle_validated) {
            $aisle = Aisle::create([
                'code' => $aisle_validated['code'],
                'group_id' => isset($aisle_validated['group_id']) ? $aisle_validated['group_id'] : null,
                'warehouse_id' => $warehouse->id,
            ]);

            $locations = [];
            for ($col = 1; $col <= $aisle_validated['columns']; $col++) {
                for ($row = 1; $row <= $aisle_validated['rows']; $row++) {
                    $locations[] = [
                        'column' => $col,
                        'row' => $row,
                        'aisle_id' => $aisle->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            Location::insert($locations);
        }

        return redirect(route('warehouses.show', $warehouse->id));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Aisle $aisle): Response
    {
        if ($request->user()->company_id != $aisle->warehouse->company_id) abort(403);

        $groups = $request->user()->company->groups;

        return Inertia::render('Company/Warehouses/Aisles/Edit', [
            'aisle' => $aisle->load('locations'),
            'groups' => $groups,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Aisle $aisle): RedirectResponse
    {
        if ($request->user()->company_id != $aisle->warehouse->company_id) abort(403);

        $validated = $request->validate([
            'code' => ['regex:/^[A-Za-z0-9]{2}$/', Rule::unique('aisles')->where(function ($query) use ($aisle) {
                return $query->where('warehouse_id', $aisle->warehouse_id)->where('id', '!=', $aisle->id);
            })],
            'group_id' => ['nullable', Rule::exists('groups', 'id')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'columns' => 'integer|min:1|max:100',
            'rows' => 'integer|min:1|max:100',
        ]);

        $actual_columns = $aisle->locations->max('column');
        $new_columns = $validated['columns'] ? $validated['columns'] : $actual_columns;

        $actual_rows = $aisle->locations->max('row');
        $new_rows = $validated['rows'] ? $validated['rows'] : $actual_rows;

        $new_locations = [];

        if ($new_columns > $actual_columns) {
            for ($col = $actual_columns + 1; $col <= $new_columns; $col++) {
                for ($row = 1; $row <= $actual_rows; $row++) {
                    $new_locations[] = [
                        'column' => $col,
                        'row' => $row,
                        'aisle_id' => $aisle->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        if ($new_rows > $actual_rows) {
            for ($col = 1; $col <= $actual_columns; $col++) {
                for ($row = $actual_rows + 1; $row <= $new_rows; $row++) {
                    $new_locations[] = [
                        'column' => $col,
                        'row' => $row,
                        'aisle_id' => $aisle->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        if ($new_columns > $actual_columns && $new_rows > $actual_rows) {
            for ($col = $actual_columns + 1; $col <= $new_columns; $col++) {
                for ($row = $actual_rows + 1; $row <= $new_rows; $row++) {
                    $new_locations[] = [
                        'column' => $col,
                        'row' => $row,
                        'aisle_id' => $aisle->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        Location::insert($new_locations);

        Location::where('aisle_id', $aisle->id)->where(function ($query) use ($new_columns, $new_rows) {
            return $query->where('column', '>', $new_columns)->orWhere('row', '>', $new_rows);
        })->delete();

        if ($validated['columns']) unset($validated['columns']);
        if ($validated['rows']) unset($validated['rows']);

        $aisle->update($validated);

        return redirect(route('warehouses.show', $aisle->warehouse_id));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Aisle $aisle): RedirectResponse
    {
        if ($request->user()->company_id != $aisle->warehouse->company_id) abort(403);

        $warehouse_id = $aisle->warehouse_id;

        $aisle->delete();

        return redirect(route('warehouses.edit', $warehouse_id));
    }
}

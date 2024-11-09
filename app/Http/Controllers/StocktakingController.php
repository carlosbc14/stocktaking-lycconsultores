<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Product;
use App\Models\ProductStocktaking;
use App\Models\Stocktaking;
use App\Traits\FilterAndSortTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\SimpleExcel\SimpleExcelWriter;

class StocktakingController extends Controller
{
    use FilterAndSortTrait;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Stocktaking::class);

        $perPage = $request->input('perPage', 10);

        $query = $request->user()->company->stocktakings()->with(['user', 'warehouse']);

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $stocktakings */
        $stocktakings = $query->paginate($perPage);

        return Inertia::render('Company/Stocktakings/Index', [
            'stocktakings' => $stocktakings->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Stocktaking::class);

        return Inertia::render('Company/Stocktakings/Create', [
            'warehouses' => $request->user()->company->warehouses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Stocktaking::class);

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

    public function selectLocation(Stocktaking $stocktaking): Response
    {
        $this->authorize('update', $stocktaking);

        $stocktaking->load(['warehouse.aisles.locations.products' => function ($query) use ($stocktaking) {
            $query->where('stocktaking_id', $stocktaking->id);
        }]);

        return Inertia::render('Company/Stocktakings/SelectLocation', [
            'stocktaking' => $stocktaking,
        ]);
    }

    public function run(Stocktaking $stocktaking, Location $location): Response
    {
        $this->authorize('perform', [$stocktaking, $location]);

        return Inertia::render('Company/Stocktakings/Run', [
            'stocktaking' => $stocktaking,
            'location' => $location->load('aisle'),
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
        $location = Location::findOrFail($request->location_id);

        $this->authorize('perform', [$stocktaking, $location]);

        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => ['required', Rule::exists('products', 'id')->where(function ($query) use ($stocktaking) {
                return $query->where('company_id', $stocktaking->company_id);
            })],
            'products.*.batch' => 'nullable|string|max:255',
            'products.*.expiry_date' => 'nullable|date_format:Y-m-d|max:255',
            'products.*.quantity' => 'required|numeric|min:1',
        ]);

        foreach ($validated['products'] as $product) {
            $stocktaking->products()->attach($product['id'], [
                'batch' => $product['batch'] ?? null,
                'expiry_date' => $product['expiry_date'] ?? null,
                'quantity' => $product['quantity'],
                'location_id' => $location->id,
            ]);
        }

        return redirect(route('stocktakings.selectLocation', $stocktaking->id));
    }

    public function showLocation(Request $request, Stocktaking $stocktaking, Location $location): Response
    {
        $this->authorize('perform', [$stocktaking, $location]);

        $perPage = $request->input('perPage', 10);

        $query = Product::with('group')->join('product_stocktaking', 'products.id', '=', 'product_stocktaking.product_id')
            ->where('product_stocktaking.stocktaking_id', $stocktaking->id)
            ->where('product_stocktaking.location_id', $location->id)
            ->select(
                'products.*',
                'product_stocktaking.batch as pivot_batch',
                'product_stocktaking.expiry_date as pivot_expiry_date',
                'product_stocktaking.quantity as pivot_quantity'
            );

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $products */
        $products = $query->paginate($perPage);
        $products->transform(function ($product) {
            $product->pivot = [
                'batch' => $product->pivot_batch,
                'expiry_date' => $product->pivot_expiry_date,
                'quantity' => $product->pivot_quantity,
            ];

            return $product->makeHidden(['pivot_batch', 'pivot_expiry_date', 'pivot_quantity']);
        });

        return Inertia::render('Company/Stocktakings/ShowLocation', [
            'stocktaking' => $stocktaking,
            'location' => $location->load('aisle'),
            'products' => $products->withQueryString(),
        ]);
    }

    public function resetLocation(Stocktaking $stocktaking, Location $location): RedirectResponse
    {
        $this->authorize('perform', [$stocktaking, $location]);

        ProductStocktaking::where('stocktaking_id', $stocktaking->id)->where('location_id', $location->id)->delete();

        return redirect(route('stocktakings.run', [
            'stocktaking' => $stocktaking->id,
            'location' => $location->id,
        ]));
    }

    public function finalize(Request $request, Stocktaking $stocktaking): RedirectResponse
    {
        $this->authorize('update', $stocktaking);

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
        $this->authorize('view', $stocktaking);

        $perPage = $request->input('perPage', 10);

        $query = $stocktaking->products()->with('group');

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $products */
        $products = $query->paginate($perPage);

        $products->each(function ($product) {
            $product->pivot->load('location.aisle');
        });

        return Inertia::render('Company/Stocktakings/Show', [
            'stocktaking' => $stocktaking->load('warehouse'),
            'products' => $products->withQueryString(),
        ]);
    }

    /**
     * Export the specified resource.
     */
    public function export(Request $request, Stocktaking $stocktaking): void
    {
        $this->authorize('view', $stocktaking);

        $rows = [];

        $rows[] = ['', '', '', strtoupper(__('Inventory Reporting'))];
        $rows[] = [];

        $companyInfo = [
            __('Company') => $request->user()->company->name,
            __('RUT') => $request->user()->company->rut,
            __('Address') => $request->user()->company->address,
        ];
        foreach ($companyInfo as $key => $value) $rows[] = ['', $key, $value];
        $rows[] = [];

        $formattedDate = str_replace('/', '-', $stocktaking->created_at->isoFormat('L'));
        $stocktakingInfo = [
            __('Number') => $stocktaking->id,
            __('Warehouse') => $stocktaking->warehouse->name . ' (' . $stocktaking->warehouse->code . ')',
            __('Date') => $formattedDate,
            __('User') => $stocktaking->user->name,
        ];
        foreach ($stocktakingInfo as $key => $value) $rows[] = ['', $key, $value];

        $rows[] = [];
        $rows[] = [
            '',
            __('Group'),
            __('Code'),
            __('Description'),
            __('Batch'),
            __('Expiry Date'),
            __('Quantity'),
            __('Unit Price'),
            __('Total'),
            __('Location'),
            __('Aisle Group'),
        ];

        $totalPrice = 0;
        $iteration = 0;
        $stocktaking->products()->get()->each(function ($product) use (&$rows, &$totalPrice, &$iteration) {
            $iteration++;

            $rows[] = [
                $iteration,
                $product['group'] ? $product['group']['name'] : '-',
                $product['code'],
                $product['description'],
                $product['batch'] ? $product['pivot']['batch'] : '-',
                $product['expiry_date'] ? $product['pivot']['expiry_date'] : '-',
                $product['pivot']['quantity'],
                $product['price'] ?? 0,
                $product['price'] * $product['pivot']['quantity'],
                $product['pivot']['location']['aisle']['code'] . '-' . $product['pivot']['location']['column'] . '-' . $product['pivot']['location']['row'],
                $product['pivot']['location']['aisle']['group'] ? $product['pivot']['location']['aisle']['group']['name'] : '',
            ];

            $totalPrice += $product['price'] * $product['pivot']['quantity'];
        });
        $rows[] = ['', '', '', '', '', '', '', __('Total'), $totalPrice];

        SimpleExcelWriter::streamDownload(__('Stocktaking') . ' ' . $formattedDate . ' ' . $request->user()->company->name . '.xlsx')->noHeaderRow()->addRows($rows);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Stocktaking $stocktaking): Response
    {
        $this->authorize('update', $stocktaking);

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
        $this->authorize('update', $stocktaking);

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
    public function destroy(Stocktaking $stocktaking): RedirectResponse
    {
        $this->authorize('delete', $stocktaking);

        $stocktaking->delete();

        return redirect(route('stocktakings.index'));
    }
}

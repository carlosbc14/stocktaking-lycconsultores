<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductStocktaking;
use App\Models\Stocktaking;
use App\Traits\FilterAndSortTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\SimpleExcel\SimpleExcelReader;
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

        $products->each(function ($product) use ($request) {
            $product->pivot->load('location.aisle');

            if ($request->user()->hasRole('operator') || $request->user()->hasRole('lead_operator')) {
                unset($product->price);
            }
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

        $startDate = str_replace('/', '-', $stocktaking->created_at->isoFormat('L'));
        $endDate = $stocktaking->finished_at ? str_replace('/', '-', $stocktaking->finished_at->isoFormat('L')) : '-';
        $exportDate = str_replace('/', '-', now()->isoFormat('L'));
        $stocktakingInfo = [
            __('Number') => $stocktaking->id,
            __('Warehouse') => $stocktaking->warehouse->name . ' (' . $stocktaking->warehouse->code . ')',
            __('User in Charge') => $stocktaking->user->name,
        ];
        foreach ($stocktakingInfo as $key => $value) $rows[] = ['', $key, $value];
        $rows[] = ['', __('Start Date'), $startDate, '',  __('End Date'), $endDate, '', __('Export Date'), $exportDate];

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

        SimpleExcelWriter::streamDownload(__('Stocktaking') . ' ' . $exportDate . ' ' . $request->user()->company->name . '.xlsx')->noHeaderRow()->addRows($rows);
    }

    /**
     * Export the multi resource.
     */
    public function multiExport(Request $request): void
    {
        $stocktaking_ids = $request->query('stocktaking_ids', []);

        $this->authorize('viewAny', Stocktaking::class);

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
            __('Warehouse'),
            __('Location'),
            __('Aisle Group'),
        ];

        $totalPrice = 0;
        $iteration = 0;
        $stocktakings = $request->user()->company->stocktakings()
            ->with(['user', 'warehouse', 'products'])
            ->whereIn('id', $stocktaking_ids)
            ->get();

        $groupedProducts = [];

        $stocktakings->each(function ($stocktaking) use (&$groupedProducts) {
            $stocktaking->products->each(function ($product) use (&$groupedProducts, $stocktaking) {
                $key = $product->id . '-';
                $key .= ($product->pivot->location_id ?? 'null') . '-';
                $key .= ($product->pivot->batch ?? 'null') . '-';
                $key .= ($product->pivot->expiry_date ?? 'null');

                if (!isset($groupedProducts[$key])) {
                    $groupedProducts[$key] = [
                        'product' => $product,
                        'warehouse' => $stocktaking->warehouse,
                        'total_quantity' => 0,
                    ];
                }

                $groupedProducts[$key]['total_quantity'] += $product->pivot->quantity;
            });
        });

        foreach ($groupedProducts as $data) {
            $product = $data['product'];
            $warehouse = $data['warehouse'];
            $quantity = $data['total_quantity'];

            $iteration++;

            $rows[] = [
                $iteration,
                $product['group'] ? $product['group']['name'] : '-',
                $product['code'],
                $product['description'],
                $product['batch'] ? $product['pivot']['batch'] : '-',
                $product['expiry_date'] ? $product['pivot']['expiry_date'] : '-',
                $quantity,
                $product['price'] ?? 0,
                $product['price'] * $quantity,
                $warehouse ? $warehouse['name'] : '-',
                $product['pivot']['location']['aisle']['code'] . '-' . $product['pivot']['location']['column'] . '-' . $product['pivot']['location']['row'],
                $product['pivot']['location']['aisle']['group'] ? $product['pivot']['location']['aisle']['group']['name'] : '',
            ];

            $totalPrice += $product['price'] * $quantity;
        }
        $rows[] = ['', '', '', '', '', '', '', __('Total'), $totalPrice];

        SimpleExcelWriter::streamDownload(__('Stocktakings') . ' ' . $request->user()->company->name . '.xlsx')->noHeaderRow()->addRows($rows);
    }

    public function stock(Request $request, Stocktaking $stocktaking): Response
    {
        $this->authorize('viewAny', Stocktaking::class);

        $perPage = $request->input('perPage', 10);

        $query = $stocktaking->stockProducts()->with('group');

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $products */
        $products = $query->paginate($perPage);

        return Inertia::render('Company/Stocktakings/Stock', [
            'stocktakingId' => $stocktaking->id,
            'products' => $products->withQueryString(),
            'failures' => session('failures', []),
        ]);
    }

    public function exportComparison(Stocktaking $stocktaking): void
    {
        $this->authorize('update', $stocktaking);

        $header = [
            __('Group'),
            __('Code'),
            __('Description'),
            __('Warehouses Code'),
            __('Warehouse'),
            __('Batch'),
            __('Expiry Date'),
            __('Unit'),
            __('Stock'),
            __('Inventory'),
            __('Difference'),
        ];

        $rows = [];
        $stocktaking->products()->with('group')->get()->each(function ($product) use (&$rows, $stocktaking) {
            $product->pivot->load('location.aisle.warehouse');
            $stockProduct = ProductStock::where('product_id', $product['id'])->where('stocktaking_id', $stocktaking->id)->first();

            $rows[] = [
                $product['group'] ? $product['group']['name'] : '-',
                $product['code'],
                $product['description'],
                $product['pivot']['location']['aisle']['warehouse']['code'],
                $product['pivot']['location']['aisle']['warehouse']['name'],
                $product['batch'] ? $product['pivot']['batch'] : '-',
                $product['expiry_date'] ? $product['pivot']['expiry_date'] : '-',
                $product['unit'] ?? '-',
                $stockProduct['stock'] ?? 0,
                $product['pivot']['quantity'],
                $product['pivot']['quantity'] - ($stockProduct['stock'] ?? 0),
            ];
        });

        SimpleExcelWriter::streamDownload('stocktaking_comparison.xlsx')->addHeader($header)->addRows($rows);
    }

    public function importStock(Request $request, Stocktaking $stocktaking): RedirectResponse
    {
        $this->authorize('update', $stocktaking);

        $request->validate([
            'excel' => 'required|file|mimes:xlsx',
        ]);

        $company_id = $request->user()->company_id;
        $trad = [
            'code' => __('Code'),
            'batch' => __('Batch'),
            'expiry_date' => __('Expiry Date'),
            'stock' => __('Stock'),
        ];
        $failures = [];

        $rows = SimpleExcelReader::create($request->excel, 'xlsx')->getRows();
        $rows->each(function (array $row, int $key) use ($company_id, $stocktaking, $trad, &$failures) {
            $data = array_filter([
                'batch' => empty($row[$trad['batch']])
                    ? null : trim($row[$trad['batch']]),
                'expiry_date' => empty($row[$trad['expiry_date']])
                    ? null : (
                        $row[$trad['expiry_date']] instanceof string
                        ? trim($row[$trad['expiry_date']])
                        : $row[$trad['expiry_date']]
                    ),
                'stock' => empty($row[$trad['stock']])
                    ? null : trim($row[$trad['stock']]),
            ], fn($value) => !is_null($value) && $value !== '');

            try {
                $product = Product::where('company_id', $company_id)->where('code', $row[$trad['code']])->first();
                $stocktaking->stockProducts()->attach($product->id, $data);
            } catch (\Throwable $th) {
                $failures[] = $key + 2;
            }
        });

        return redirect(route('stocktakings.stock', $stocktaking->id))->with('failures', $failures);
    }

    public function resetStock(Stocktaking $stocktaking): RedirectResponse
    {
        $this->authorize('update', $stocktaking);

        ProductStock::where('stocktaking_id', $stocktaking->id)->delete();

        return redirect(route('stocktakings.stock', $stocktaking->id));
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

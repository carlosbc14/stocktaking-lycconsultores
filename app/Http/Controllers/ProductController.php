<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Traits\FilterAndSortTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\SimpleExcel\SimpleExcelReader;
use Spatie\SimpleExcel\SimpleExcelWriter;

class ProductController extends Controller
{
    use FilterAndSortTrait;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $perPage = $request->input('perPage', 10);

        $query = $request->user()->company->products()->with('group');

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $products */
        $products = $query->paginate($perPage);

        return Inertia::render('Company/Products/Index', [
            'products' => $products->withQueryString(),
            'failures' => session('failures', []),
        ]);
    }

    /**
     * Export a listing of the resource.
     */
    public function export(Request $request): void
    {
        $this->authorize('viewAny', Product::class);

        $availableColumns = [
            'code' => __('Code'),
            'description' => __('Description'),
            'group' => __('Group'),
            'unit' => __('Unit'),
            'origin' => __('Origin'),
            'currency' => __('Currency'),
            'price' => __('Price'),
            'batch' => __('Batch'),
            'expiry_date' => __('Expiry Date'),
            'enabled' => __('Enabled'),
        ];

        $selectedColumns = $request->input('columns', $availableColumns);
        if (!isset($selectedColumns['code'])) $selectedColumns = array_merge(['code' => true], $selectedColumns);

        $header = array_filter($availableColumns, fn($key) => isset($selectedColumns[$key]) && $selectedColumns[$key], ARRAY_FILTER_USE_KEY);

        $rows = [];
        $request->user()->company->products()->with('group')->get()->each(function ($product) use (&$rows, $selectedColumns) {
            $row = [];

            foreach ($selectedColumns as $column => $inExcel) {
                if ($inExcel) {
                    switch ($column) {
                        case 'code':
                            $row[] = $product['code'];
                            break;
                        case 'description':
                            $row[] = $product['description'] ?? '';
                            break;
                        case 'group':
                            $row[] = $product['group'] ? $product['group']['name'] : '';
                            break;
                        case 'unit':
                            $row[] = $product['unit'] ?? '';
                            break;
                        case 'origin':
                            $row[] = $product['origin'] ?? '';
                            break;
                        case 'currency':
                            $row[] = $product['currency'] ?? '';
                            break;
                        case 'price':
                            $row[] = $product['price'] ?? '';
                            break;
                        case 'batch':
                            $row[] = $product['batch'] ? __('Yes')[0] : __('No')[0];
                            break;
                        case 'expiry_date':
                            $row[] = $product['expiry_date'] ? __('Yes')[0] : __('No')[0];
                            break;
                        case 'enabled':
                            $row[] = $product['enabled'] ? __('Yes')[0] : __('No')[0];
                            break;
                    }
                }
            }

            $rows[] = $row;
        });

        SimpleExcelWriter::streamDownload('products.xlsx')->addHeader($header)->addRows($rows);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Product::class);

        return Inertia::render('Company/Products/Create', [
            'groups' => $request->user()->company->groups,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Product::class);

        $validated = $request->validate([
            'products.*.code' => ['required', 'string', 'max:255', Rule::unique('products')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'products.*.description' => 'required|string|max:255',
            'products.*.unit' => 'nullable|string|max:255',
            'products.*.origin' => 'nullable|string|max:255',
            'products.*.currency' => 'nullable|string|max:255',
            'products.*.price' => 'nullable|numeric|min:0',
            'products.*.batch' => 'boolean',
            'products.*.expiry_date' => 'boolean',
            'products.*.enabled' => 'boolean',
            'products.*.group_id' => ['nullable', Rule::exists('groups', 'id')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
        ]);

        foreach ($validated['products'] as &$product) {
            $product['company_id'] = $request->user()->company_id;
            $product['created_at'] = now();
            $product['updated_at'] = now();
        }

        Product::insert($validated['products']);

        return redirect(route('products.index'));
    }

    /**
     * Import a newly created resource in storage.
     */
    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create', Product::class);

        $request->validate([
            'excel' => 'required|file|mimes:xlsx',
        ]);

        $company_id = $request->user()->company_id;
        $groups = $request->user()->company->groups()->pluck('id', 'name')->toArray();
        $trad = [
            'code' => __('Code'),
            'description' => __('Description'),
            'unit' => __('Unit'),
            'origin' => __('Origin'),
            'currency' => __('Currency'),
            'price' => __('Price'),
            'batch' => __('Batch'),
            'expiry_date' => __('Expiry Date'),
            'enabled' => __('Enabled'),
            'group' => __('Group'),
            'yes' => __('Yes'),
        ];
        $failures = [];

        $rows = SimpleExcelReader::create($request->excel, 'xlsx')->getRows();
        $rows->each(function (array $row, int $key) use ($company_id, $groups, $trad, &$failures) {
            $data = array_filter([
                'description' => empty($row[$trad['description']])
                    ? null : trim($row[$trad['description']]),
                'unit' => empty($row[$trad['unit']])
                    ? null : trim($row[$trad['unit']]),
                'origin' => empty($row[$trad['origin']])
                    ? null : trim($row[$trad['origin']]),
                'currency' => empty($row[$trad['currency']])
                    ? null : trim($row[$trad['currency']]),
                'price' => empty($row[$trad['price']])
                    ? null : $row[$trad['price']],
                'batch' => empty($row[$trad['batch']])
                    ? null : trim($row[$trad['batch']]) == $trad['yes'][0],
                'expiry_date' => empty($row[$trad['expiry_date']])
                    ? null : trim($row[$trad['expiry_date']]) == $trad['yes'][0],
                'enabled' => empty($row[$trad['enabled']])
                    ? null : trim($row[$trad['enabled']]) == $trad['yes'][0],
                'group_id' => empty($row[$trad['group']]) || empty($groups[trim($row[$trad['group']])])
                    ? null : $groups[trim($row[$trad['group']])],
            ], fn($value) => !is_null($value) && $value !== '');

            try {
                Product::updateOrCreate([
                    'code' => empty($row[$trad['code']])
                        ? null : str_replace("'", '', trim($row[$trad['code']])),
                    'company_id' => $company_id,
                ], $data);
            } catch (\Throwable $th) {
                $failures[] = $key + 2;
            }
        });

        return redirect(route('products.index'))->with('failures', $failures);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Product $product): Response
    {
        $this->authorize('update', $product);

        return Inertia::render('Company/Products/Edit', [
            'product' => $product,
            'groups' => $request->user()->company->groups,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'code' => ['string', 'max:255', Rule::unique('products')->where(function ($query) use ($product) {
                return $query->where('company_id', $product->company_id)->where('id', '!=', $product->id);
            })],
            'description' => 'string|max:255',
            'unit' => 'nullable|string|max:255',
            'origin' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'batch' => 'boolean',
            'expiry_date' => 'boolean',
            'enabled' => 'boolean',
            'group_id' => ['nullable', Rule::exists('groups', 'id')->where(function ($query) use ($product) {
                return $query->where('company_id', $product->company_id);
            })],
        ]);

        $product->update($validated);

        return redirect(route('products.index'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        $product->delete();

        return redirect(route('products.index'));
    }
}

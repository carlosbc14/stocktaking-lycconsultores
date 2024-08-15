<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\SimpleExcel\SimpleExcelReader;
use Spatie\SimpleExcel\SimpleExcelWriter;

class ProductController extends Controller
{
    public function __construct()
    {
        $this->middleware(['permission:write products'])->only(['create', 'store']);
        $this->middleware(['permission:read products'])->only(['index']);
        $this->middleware(['permission:edit products'])->only(['edit', 'update']);
        $this->middleware(['permission:delete products'])->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Company/Products/Index', [
            'products' => $request->user()->company->products()->with('group')->get(),
            'failures' => session('failures', []),
        ]);
    }

    /**
     * Export a listing of the resource.
     */
    public function export(Request $request): void
    {
        $rows = [];

        $request->user()->company->products()->with('group')->get()->each(function ($product) use (&$rows) {
            $rows[] = [
                $product['code'],
                $product['description'],
                $product['group'] ? $product['group']['name'] : '',
                $product['unit'] ?? '',
                $product['origin'] ?? '',
                $product['currency'] ?? '',
                $product['price'] ?? '',
                $product['batch'] ? __('Yes')[0] : __('No')[0],
                $product['enabled'] ? __('Yes')[0] : __('No')[0],
            ];
        });

        SimpleExcelWriter::streamDownload('products.xlsx')->addHeader([
            __('Code'),
            __('Description'),
            __('Group'),
            __('Unit'),
            __('Origin'),
            __('Currency'),
            __('Price'),
            __('Batch'),
            __('Enabled'),
        ])->addRows($rows);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Company/Products/Create', [
            'groups' => $request->user()->company->groups,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
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
            'enabled' => __('Enabled'),
            'group' => __('Group'),
            'yes' => __('Yes'),
        ];
        $failures = [];

        $rows = SimpleExcelReader::create($request->excel, 'xlsx')->getRows();
        $rows->each(function (array $row, int $key) use ($company_id, $groups, $trad, &$failures) {
            try {
                Product::create([
                    'code' => empty($row[$trad['code']])
                        ? null : $row[$trad['code']],
                    'description' => empty($row[$trad['description']])
                        ? null : $row[$trad['description']],
                    'unit' => empty($row[$trad['unit']])
                        ? null : $row[$trad['unit']],
                    'origin' => empty($row[$trad['origin']])
                        ? null : $row[$trad['origin']],
                    'currency' => empty($row[$trad['currency']])
                        ? null : $row[$trad['currency']],
                    'price' => empty($row[$trad['price']])
                        ? null : $row[$trad['price']],
                    'batch' => !empty($row[$trad['batch']]) && $row[$trad['batch']] == $trad['yes'][0],
                    'enabled' => !empty($row[$trad['enabled']]) && $row[$trad['enabled']] == $trad['yes'][0],
                    'group_id' => empty($groups[$row[$trad['group']]])
                        ? null : $groups[$row[$trad['group']]],
                    'company_id' => $company_id,
                ]);
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
        if ($request->user()->company_id != $product->company_id) abort(403);

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
        if ($request->user()->company_id != $product->company_id) abort(403);

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
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        if ($request->user()->company_id != $product->company_id) abort(403);

        $product->delete();

        return redirect(route('products.index'));
    }
}

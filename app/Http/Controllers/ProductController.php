<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

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
        $products = $request->user()->company->products;

        return Inertia::render('Company/Products/Index', [
            'products' => $products->load('group'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $groups = $request->user()->company->groups;

        return Inertia::render('Company/Products/Create', [
            'groups' => $groups,
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
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Product $product): Response
    {
        if ($request->user()->company_id != $product->company_id) abort(403);

        $groups = $request->user()->company->groups;

        return Inertia::render('Company/Products/Edit', [
            'product' => $product,
            'groups' => $groups,
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

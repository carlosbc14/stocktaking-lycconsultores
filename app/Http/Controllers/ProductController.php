<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Company/Products/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'products.*.code_sku' => 'required|unique:products|string|max:255',
            'products.*.description' => 'required|string|max:255',
            'products.*.institution' => 'required|string|max:255',
        ]);

        foreach ($validated['products'] as &$product_validated) {
            $product = Product::create([
                'code_sku' => $product_validated['code_sku'],
                'description' => $product_validated['description'],
                'institution' => $product_validated['institution'],
            ]);

            $request->user()->company->products()->save($product);
        }

        return redirect(route('products.index'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Product $product): Response
    {
        if ($request->user()->company->id != $product->company_id) {
            throw new AuthorizationException('Forbidden');
        }

        return Inertia::render('Company/Products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        if ($request->user()->company->id != $product->company_id) {
            throw new AuthorizationException('Forbidden');
        }

        $validated = $request->validate([
            'code_sku' => 'string|max:255|unique:products,code_sku,' . $product->id,
            'description' => 'string|max:255',
            'institution' => 'string|max:255',
        ]);

        $product->update($validated);

        return redirect(route('products.index'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        if ($request->user()->company->id != $product->company_id) {
            throw new AuthorizationException('Forbidden');
        }

        $product->delete();

        return redirect(route('products.index'));
    }
}

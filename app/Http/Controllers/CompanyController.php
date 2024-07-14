<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Freshwork\ChileanBundle\Rut;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function __construct()
    {
        $this->middleware(['permission:write company'])->only(['create', 'store']);
        $this->middleware(['permission:read company'])->only(['show']);
        $this->middleware(['permission:edit company'])->only(['edit', 'update']);
        $this->middleware(['permission:delete company'])->only(['destroy']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Company/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'rut' => Rut::parse($request->rut)->quiet()->format(),
        ]);

        $validated = $request->validate([
            'rut' => 'required|cl_rut|unique:' . Company::class,
            'name' => 'required|string|max:255',
            'business_sector' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        $company = Company::create($validated);
        $company->users()->save($request->user());

        return redirect(route('dashboard'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request): Response
    {
        if (!$request->user()->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        $company = Company::findOrFail($request->user()->company->id);

        return Inertia::render('Company/Show', [
            'company' => $company->load('users'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request): Response
    {
        if (!$request->user()->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        $company = Company::findOrFail($request->user()->company->id);

        return Inertia::render('Company/Edit', [
            'company' => $company,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request): RedirectResponse
    {
        if (!$request->user()->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        $company = Company::findOrFail($request->user()->company->id);

        $request->merge([
            'rut' => Rut::parse($request->rut)->quiet()->format(),
        ]);

        $validated = $request->validate([
            'rut' => 'cl_rut|unique:companies,rut,' . $company->id,
            'name' => 'string|max:255',
            'business_sector' => 'string|max:255',
            'address' => 'string|max:255',
        ]);

        $company->update($validated);

        return redirect(route('company.show'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if (!$request->user()->company->id) {
            throw new AuthorizationException('Forbidden');
        }

        $company = Company::findOrFail($request->user()->company->id);

        $company->delete();

        return redirect(route('dashboard'));
    }
}

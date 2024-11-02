<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Traits\FilterAndSortTrait;
use Freshwork\ChileanBundle\Rut;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    use FilterAndSortTrait;

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Company::class);

        return Inertia::render('Company/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Company::class);

        $request->merge([
            'rut' => Rut::parse($request->rut)->quiet()->format(),
        ]);

        if ($request->legal_representative_rut) $request->merge([
            'legal_representative_rut' => Rut::parse($request->legal_representative_rut)->quiet()->format(),
        ]);

        $validated = $request->validate([
            'rut' => 'required|cl_rut|unique:' . Company::class,
            'name' => 'required|string|max:255',
            'business_sector' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'legal_representative_rut' => 'nullable|cl_rut',
            'legal_representative_name' => 'nullable|string|max:255',
            'legal_representative_position' => 'nullable|string|max:255',
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
        $this->authorize('view', Company::class);

        $company = Company::findOrFail($request->user()->company->id);

        $perPage = $request->input('perPage', 10);

        $query = $company->users();

        $query = $this->applyFilters($request, $query);
        $query = $this->applySorting($request, $query);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $users */
        $users = $query->paginate($perPage);

        $users->each(function ($user) use ($request) {
            $user->role = $user->roles->first();
            $user->makeHidden('roles');
            $user->permissions = [
                'canEdit' => $request->user()->can('update', $user),
                'canDelete' => $request->user()->can('delete', $user),
            ];
        });

        return Inertia::render('Company/Show', [
            'company' => $company,
            'users' => $users->withQueryString(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request): Response
    {
        $this->authorize('update', Company::class);

        return Inertia::render('Company/Edit', [
            'company' => Company::findOrFail($request->user()->company->id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request): RedirectResponse
    {
        $this->authorize('update', Company::class);

        $company = Company::findOrFail($request->user()->company->id);

        $request->merge([
            'rut' => Rut::parse($request->rut)->quiet()->format(),
        ]);

        if ($request->legal_representative_rut) $request->merge([
            'legal_representative_rut' => Rut::parse($request->legal_representative_rut)->quiet()->format(),
        ]);

        $validated = $request->validate([
            'rut' => 'cl_rut|unique:companies,rut,' . $company->id,
            'name' => 'string|max:255',
            'business_sector' => 'string|max:255',
            'address' => 'string|max:255',
            'legal_representative_rut' => 'nullable|cl_rut',
            'legal_representative_name' => 'nullable|string|max:255',
            'legal_representative_position' => 'nullable|string|max:255',
        ]);

        $company->update($validated);

        return redirect(route('company.show'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $this->authorize('delete', Company::class);

        Company::findOrFail($request->user()->company->id)->delete();

        return redirect(route('dashboard'));
    }
}

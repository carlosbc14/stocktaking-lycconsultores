<?php

namespace App\Http\Controllers;

use App\Models\User;
use Freshwork\ChileanBundle\Rut;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Company/Users/Create', [
            'roles' => Role::pluck('name'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $request->merge([
            'rut' => Rut::parse($request->rut)->quiet()->format(),
        ]);

        $request->validate([
            'rut' => ['required', 'cl_rut', Rule::unique('users')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', Password::defaults()],
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'rut' => $request->rut,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_id' => $request->user()->company_id,
        ]);

        $user->assignRole($request->role);

        return redirect(route('company.show'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        $user->role = $user->getRoleNames()[0];

        return Inertia::render('Company/Users/Edit', [
            'user' => $user,
            'roles' => Role::pluck('name'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $request->merge([
            'rut' => Rut::parse($request->rut)->quiet()->format(),
        ]);

        $validated = $request->validate([
            'rut' => ['required', 'cl_rut', Rule::unique('users')->where(function ($query) use ($user) {
                return $query->where('company_id', $user->company_id)->where('id', '!=', $user->id);
            })],
            'name' => 'string|max:255',
            'email' => 'string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', Password::defaults()],
            'role' => 'exists:roles,name',
        ]);

        if ($validated['role']) {
            $user->syncRoles($validated['role']);

            unset($validated['role']);
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect(route('company.show'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect(route('company.show'));
    }
}

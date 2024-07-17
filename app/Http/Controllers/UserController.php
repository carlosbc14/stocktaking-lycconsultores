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
    public function __construct()
    {
        $this->middleware(['permission:write users'])->only(['create', 'store']);
        $this->middleware(['permission:edit users'])->only(['edit', 'update']);
        $this->middleware(['permission:delete users'])->only(['destroy']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $roles = Role::all()->pluck('name');

        return Inertia::render('Company/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
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
            'role' => 'required|string|max:255',
        ]);

        $user = User::create([
            'rut' => $request->rut,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_id' => $request->user()->company_id,
        ]);

        try {
            $user->assignRole($request->role);
        } catch (\Throwable $th) {
        }

        return redirect(route('company.show'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $user->role = $user->getRoleNames()[0];

        $roles = Role::all()->pluck('name');

        return Inertia::render('Company/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->merge([
            'rut' => Rut::parse($request->rut)->quiet()->format(),
        ]);

        $validated = $request->validate([
            'rut' => ['required', 'cl_rut', Rule::unique('users')->where(function ($query) use ($user) {
                return $query->where('company_id', $user->company_id)->where('id', '!=', $user->id);
            })],
            'name' => 'string|max:255',
            'email' => 'string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'role' => 'string|max:255',
        ]);

        if ($validated['role']) {
            $user->syncRoles($validated['role']);

            unset($validated['role']);
        }

        $user->update($validated);

        return redirect(route('company.show'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect(route('company.show'));
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    private function getAllGroupIds(Group $group): Collection
    {
        $group_ids = collect([$group->id]);

        foreach ($group->childGroups as $child_group) {
            $group_ids = $group_ids->merge($this->getAllGroupIds($child_group));
        }

        return $group_ids;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Group::class);

        return Inertia::render('Company/Groups/Index', [
            'groups' => $request->user()->company->groups()->with('parentGroup')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Group::class);

        return Inertia::render('Company/Groups/Create', [
            'groups' => $request->user()->company->groups,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Group::class);

        $validated = $request->validate([
            'groups.*.name' => ['required', 'string', 'max:255', Rule::unique('groups')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
            'groups.*.group_id' => ['nullable', Rule::exists('groups', 'id')->where(function ($query) use ($request) {
                return $query->where('company_id', $request->user()->company_id);
            })],
        ]);

        foreach ($validated['groups'] as &$group) {
            $group['company_id'] = $request->user()->company_id;
            $group['created_at'] = now();
            $group['updated_at'] = now();
        }

        Group::insert($validated['groups']);

        return redirect(route('groups.index'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Group $group): Response
    {
        $this->authorize('update', $group);

        return Inertia::render('Company/Groups/Edit', [
            'group' => $group,
            'groups' => $request->user()->company->groups()->whereNotIn('id', $this->getAllGroupIds($group))->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Group $group): RedirectResponse
    {
        $this->authorize('update', $group);

        $all_child_groups = $this->getAllGroupIds($group);

        $validated = $request->validate([
            'name' => ['string', 'max:255', Rule::unique('groups')->where(function ($query) use ($group) {
                return $query->where('company_id', $group->company_id)->where('id', '!=', $group->id);
            })],
            'group_id' => ['nullable', Rule::exists('groups', 'id')->where(function ($query) use ($group, $all_child_groups) {
                return $query->where('company_id', $group->company_id)->whereNotIn('id', $all_child_groups);
            })],
        ]);

        $group->update($validated);

        return redirect(route('groups.index'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group): RedirectResponse
    {
        $this->authorize('delete', $group);

        $group->delete();

        return redirect(route('groups.index'));
    }
}

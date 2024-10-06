<?php

namespace App\Policies;

use App\Models\Aisle;
use App\Models\User;
use App\Models\Warehouse;

class WarehousePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('read warehouses');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Warehouse $warehouse): bool
    {
        return $user->company->is($warehouse->company) && $user->can('read warehouses');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('write warehouses');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Warehouse $warehouse): bool
    {
        return $user->company->is($warehouse->company) && $user->can('edit warehouses');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function updateAisle(User $user, Warehouse $warehouse, Aisle $aisle): bool
    {
        return $user->company->is($warehouse->company) && $aisle->warehouse->is($warehouse) && $user->can('edit warehouses');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Warehouse $warehouse): bool
    {
        return $user->company->is($warehouse->company) && $user->can('delete warehouses');
    }
}

<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\Stocktaking;
use App\Models\User;

class StocktakingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('read stocktakings');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Stocktaking $stocktaking): bool
    {
        return $user->company->is($stocktaking->company) && $user->can('read stocktakings');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('write stocktakings');
    }

    /**
     * Determine whether the user can perform the model.
     */
    public function perform(User $user, Stocktaking $stocktaking, Location $location): bool
    {
        return $user->company->is($stocktaking->company) && $user->company->is($location->aisle->warehouse->company) && $user->can('write stocktakings');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Stocktaking $stocktaking): bool
    {
        return $user->company->is($stocktaking->company) && $user->can('edit stocktakings');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Stocktaking $stocktaking): bool
    {
        return $user->company->is($stocktaking->company) && $user->can('delete stocktakings');
    }
}

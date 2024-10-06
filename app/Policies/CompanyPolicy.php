<?php

namespace App\Policies;

use App\Models\User;

class CompanyPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user): bool
    {
        return $user->company_id && $user->can('read company');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return !$user->company_id && $user->can('write company');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user): bool
    {
        return $user->company_id && $user->can('edit company');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user): bool
    {
        return $user->company_id && $user->can('delete company');
    }
}

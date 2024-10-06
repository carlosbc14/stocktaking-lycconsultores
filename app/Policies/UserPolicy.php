<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('write users');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        if ($user->company->isNot($model->company)) return false;

        $userRole = $user->roles->first();
        $modelRole = $model->roles->first();

        if ($userRole->is($modelRole) || $userRole->name === 'admin' && $modelRole->name === 'owner') return false;

        return $user->can('edit users');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->company->isNot($model->company)) return false;

        $userRole = $user->roles->first();
        $modelRole = $model->roles->first();

        if ($userRole->is($modelRole) || $userRole->name === 'admin' && $modelRole->name === 'owner') return false;

        return $user->can('delete users');
    }
}

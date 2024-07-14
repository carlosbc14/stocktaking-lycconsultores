<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Permission::create(['name' => 'write company']);
        Permission::create(['name' => 'read company']);
        Permission::create(['name' => 'edit company']);
        Permission::create(['name' => 'delete company']);

        Role::create(['name' => 'owner'])->givePermissionTo(['write company', 'read company', 'edit company', 'delete company']);

        Role::create(['name' => 'admin'])->givePermissionTo(['read company']);

        Role::create(['name' => 'supervisor']);

        Role::create(['name' => 'lead_operator']);

        Role::create(['name' => 'operator']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

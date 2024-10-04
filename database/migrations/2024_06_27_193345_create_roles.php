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

        Permission::create(['name' => 'write users']);
        Permission::create(['name' => 'read users']);
        Permission::create(['name' => 'edit users']);
        Permission::create(['name' => 'delete users']);

        Permission::create(['name' => 'write warehouses']);
        Permission::create(['name' => 'read warehouses']);
        Permission::create(['name' => 'edit warehouses']);
        Permission::create(['name' => 'delete warehouses']);

        Permission::create(['name' => 'write groups']);
        Permission::create(['name' => 'read groups']);
        Permission::create(['name' => 'edit groups']);
        Permission::create(['name' => 'delete groups']);

        Permission::create(['name' => 'write products']);
        Permission::create(['name' => 'read products']);
        Permission::create(['name' => 'edit products']);
        Permission::create(['name' => 'delete products']);

        Permission::create(['name' => 'write stocktakings']);
        Permission::create(['name' => 'read stocktakings']);
        Permission::create(['name' => 'edit stocktakings']);
        Permission::create(['name' => 'delete stocktakings']);

        Role::create(['name' => 'owner'])->givePermissionTo([
            'write company', 'read company', 'edit company', 'delete company',
            'write users', 'read users', 'edit users', 'delete users',
            'write warehouses', 'read warehouses', 'edit warehouses', 'delete warehouses',
            'write groups', 'read groups', 'edit groups', 'delete groups',
            'write products', 'read products', 'edit products', 'delete products',
            'read stocktakings',
        ]);

        Role::create(['name' => 'admin'])->givePermissionTo([
            'read company',
            'write users', 'read users', 'edit users', 'delete users',
            'write warehouses', 'read warehouses', 'edit warehouses', 'delete warehouses',
            'write groups', 'read groups', 'edit groups', 'delete groups',
            'write products', 'read products', 'edit products', 'delete products',
            'read stocktakings',
        ]);

        Role::create(['name' => 'supervisor'])->givePermissionTo([
            'read stocktakings',
        ]);

        Role::create(['name' => 'lead_operator'])->givePermissionTo([
            'write stocktakings', 'read stocktakings', 'edit stocktakings', 'delete stocktakings',
        ]);

        Role::create(['name' => 'operator'])->givePermissionTo([
            'write stocktakings', 'read stocktakings', 'edit stocktakings',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

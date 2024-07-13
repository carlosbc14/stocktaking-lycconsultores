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
        $owner_role = Role::create(['name' => 'owner']);
        $admin_role = Role::create(['name' => 'admin']);
        $supervisor_role = Role::create(['name' => 'supervisor']);
        $lead_operator_role = Role::create(['name' => 'lead_operator']);
        $operator_role = Role::create(['name' => 'operator']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

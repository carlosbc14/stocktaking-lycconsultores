import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShowWarehouseInformation from './Partials/ShowWarehouseInformation';
import ShowWarehouseLocations from './Partials/ShowWarehouseLocations';

export default function Show({ auth, warehouse }) {
    return (
        <AuthenticatedLayout user={auth.user} title={warehouse.name}>
            <div className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowWarehouseInformation
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit warehouses')}
                        warehouse={warehouse}
                    />
                </div>

                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowWarehouseLocations
                        canCreate={auth.user.permissions.some((per) => per.name === 'write warehouses')}
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit warehouses')}
                        canDelete={auth.user.permissions.some((per) => per.name === 'delete warehouses')}
                        warehouse_id={warehouse.id}
                        locations={warehouse.locations}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

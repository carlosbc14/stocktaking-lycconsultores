import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShowWarehouseAisles from './Partials/ShowWarehouseAisles';
import ShowWarehouseInformation from './Partials/ShowWarehouseInformation';

export default function Show({ auth, warehouse, aisles }) {
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
                    <ShowWarehouseAisles
                        canCreate={auth.user.permissions.some((per) => per.name === 'write warehouses')}
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit warehouses')}
                        canDelete={auth.user.permissions.some((per) => per.name === 'delete warehouses')}
                        warehouse_id={warehouse.id}
                        aisles={aisles}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

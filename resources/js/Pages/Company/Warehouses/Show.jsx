import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShowWarehouseInformation from './Partials/ShowWarehouseInformation';

export default function Show({ auth, warehouse }) {
    return (
        <AuthenticatedLayout user={auth.user} title={warehouse.name}>
            <div className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowWarehouseInformation
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit warehouse')}
                        warehouse={warehouse}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

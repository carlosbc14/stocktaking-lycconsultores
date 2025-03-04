import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShowCompanyInformation from './Partials/ShowCompanyInformation';
import ShowCompanyUsers from './Partials/ShowCompanyUsers';

export default function Show({ auth, company, users }) {
    return (
        <AuthenticatedLayout user={auth.user} title={company.name}>
            <div className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowCompanyInformation
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit company')}
                        company={company}
                    />
                </div>

                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowCompanyUsers
                        canCreate={auth.user.permissions.some((per) => per.name === 'write users')}
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit users')}
                        canDelete={auth.user.permissions.some((per) => per.name === 'delete users')}
                        users={users}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

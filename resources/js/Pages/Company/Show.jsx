import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShowCompanyInformation from './Partials/ShowCompanyInformation';
import ShowCompanyUsers from './Partials/ShowCompanyUsers';

export default function Show({ auth, company }) {
    return (
        <AuthenticatedLayout user={auth.user} title={company.name}>
            <div className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowCompanyInformation
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit company')}
                        company={company}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

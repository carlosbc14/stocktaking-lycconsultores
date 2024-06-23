import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';

export default function Dashboard({ auth }) {
    const { __ } = useTraslations();

    return (
        <AuthenticatedLayout user={auth.user} title={__('Dashboard')}>
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">{__("You're logged in!")}</div>
            </div>
        </AuthenticatedLayout>
    );
}

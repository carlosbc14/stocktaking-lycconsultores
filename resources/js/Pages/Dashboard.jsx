import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button } from '@/Components/ui';
import { Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    const { __ } = useTraslations();

    return (
        <AuthenticatedLayout user={auth.user} title={__('Dashboard')}>
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="flex flex-1 flex-col text-center p-6 text-gray-900">
                    <h2 className="font-bold text-4xl">{__('¡Welcome to Stocktaking LYC Consultores!')}</h2>
                    {auth.user.company_id !== null ||
                        !auth.user.permissions.some((per) => per.name === 'write company') || (
                            <>
                                <p className="mt-10">{__('Create your company to start using Stocktaking')}</p>
                                <Link href={route('company.create')}>
                                    <Button className="mt-10">{__('Create')}</Button>
                                </Link>
                            </>
                        )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

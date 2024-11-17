import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useTraslations } from '@/Contexts/TranslationsContext';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const { __ } = useTraslations();

    return (
        <AuthenticatedLayout user={auth.user} title={__('Profile')}>
            <div className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import GuestLayout from '@/Layouts/GuestLayout';
import { Button, Input } from '@/Components/ui';
import { InputError } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { __ } = useTraslations();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout title={__('Forgot Password')}>
            <div className="mb-4 text-sm text-gray-600">
                {__(
                    'Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.'
                )}
            </div>

            {status && <div className="mb-4 font-medium text-sm text-green-600">{__(status)}</div>}

            <form onSubmit={submit}>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={__(errors.email)} className="mt-2" />

                <div className="flex items-center justify-end mt-4">
                    <Button className="ms-4" disabled={processing}>
                        {__('Email Password Reset Link')}
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}

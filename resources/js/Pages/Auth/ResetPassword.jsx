import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button, Input, Label } from '@/Components/ui';
import { InputError } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { __ } = useTraslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'));
    };

    return (
        <GuestLayout title={__('Reset Password')}>
            <form onSubmit={submit}>
                <div>
                    <Label htmlFor="email">{__('Email')}</Label>

                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={__(errors.email)} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="password">{__('Password')}</Label>

                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={__(errors.password)} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="password_confirmation">{__('Confirm Password')}</Label>

                    <Input
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />

                    <InputError message={__(errors.password_confirmation)} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Button className="ms-4" disabled={processing}>
                        {__('Reset Password')}
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}

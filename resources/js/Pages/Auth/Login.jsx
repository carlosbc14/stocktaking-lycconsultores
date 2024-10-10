import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button, Input, Label, buttonVariants } from '@/Components/ui';
import { Checkbox, InputError, PasswordInput } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { __ } = useTraslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout title={__('Log in')}>
            {status && <div className="mb-4 font-medium text-sm text-green-600">{__(status)}</div>}

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
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={__(errors.email)} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="password">{__('Password')}</Label>

                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={__(errors.password)} className="mt-2" />
                </div>

                <div className="block mt-4">
                    <div className="flex items-center">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <Label htmlFor="remember" className="ms-2">
                            {__('Remember me')}
                        </Label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className={`ml-auto ${buttonVariants({ variant: 'link' })} pr-0`}
                            >
                                {__('Forgot your password?')}
                            </Link>
                        )}
                    </div>
                </div>

                <Button className="w-full mt-4" disabled={processing}>
                    {__('Log in')}
                </Button>

                <div className="flex items-center justify-end mt-4">
                    <Link href={route('register')} className={`${buttonVariants({ variant: 'link' })} pr-0`}>
                        {`${__('Need an account?')} ${__('Register')}`}
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

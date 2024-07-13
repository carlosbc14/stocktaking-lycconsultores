import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button, Input, Label, buttonVariants } from '@/Components/ui';
import { InputError } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { __ } = useTraslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        rut: '',
        name: '',
        email: '',
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

        post(route('register'));
    };

    return (
        <GuestLayout title={__('Register')}>
            <form onSubmit={submit}>
                <div>
                    <Label htmlFor="rut">{__('RUT')}</Label>

                    <Input
                        id="rut"
                        name="rut"
                        value={data.rut}
                        className="mt-1 block w-full"
                        autoComplete="rut"
                        isFocused={true}
                        onChange={(e) => setData('rut', e.target.value)}
                        required
                    />

                    <InputError message={__(errors.rut)} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="name">{__('Name')}</Label>

                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={__(errors.name)} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="email">{__('Email')}</Label>

                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={__(errors.password)} className="mt-2" />
                </div>

                <div className="mt-4">
                    <Label htmlFor="password_confirmation">{__('Confirm Password')}</Label>

                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={__(errors.password_confirmation)} className="mt-2" />
                </div>

                <Button className="w-full mt-4" disabled={processing}>
                    {__('Register')}
                </Button>

                <div className="flex items-center justify-end mt-4">
                    <Link href={route('login')} className={`${buttonVariants({ variant: 'link' })} pr-0`}>
                        {`${__('Already registered?')} ${__('Log in')}`}
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button, Input, Label } from '@/Components/ui';
import { InputError } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { __ } = useTraslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'));
    };

    return (
        <GuestLayout title={__('Confirm Password')}>
            <div className="mb-4 text-sm text-gray-600">
                {__('This is a secure area of the application. Please confirm your password before continuing.')}
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <Label htmlFor="password" value={__('Password')} />

                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={__(errors.password)} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Button className="ms-4" disabled={processing}>
                        {__('Confirm')}
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}

import { useRef } from 'react';
import { Button, Input, Label, useToast } from '@/Components/ui';
import { InputError } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { useForm } from '@inertiajs/react';

export default function UpdatePasswordForm({ className = '' }) {
    const { __ } = useTraslations();
    const { toast } = useToast();
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: __('Saved Successfully'),
                });
                reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Update Password')}</h2>

                <p className="mt-1 text-sm text-gray-600">
                    {__('Ensure your account is using a long, random password to stay secure.')}
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <Label htmlFor="current_password">{__('Current Password')}</Label>

                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />

                    <InputError message={__(errors.current_password)} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="password">{__('New Password')}</Label>

                    <Input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    <InputError message={__(errors.password)} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="password_confirmation">{__('Confirm Password')}</Label>

                    <Input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />

                    <InputError message={__(errors.password_confirmation)} className="mt-2" />
                </div>

                <Button disabled={processing}>{__('Save')}</Button>
            </form>
        </section>
    );
}

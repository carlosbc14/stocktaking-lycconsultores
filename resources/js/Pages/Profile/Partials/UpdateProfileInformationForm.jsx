import { Button, Input, Label, buttonVariants, useToast } from '@/Components/ui';
import { InputError } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const { __ } = useTraslations();
    const { toast } = useToast();
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Profile Information')}</h2>

                <p className="mt-1 text-sm text-gray-600">
                    {__("Update your account's profile information and email address.")}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <Label htmlFor="name">{__('Name')}</Label>

                    <Input
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={__(errors.name)} />
                </div>

                <div>
                    <Label htmlFor="email">{__('Email')}</Label>

                    <Input
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={__(errors.email)} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            {__('Your email address is unverified.')}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className={`${buttonVariants({ variant: 'link' })} pl-0`}
                            >
                                {__('Click here to re-send the verification email.')}
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                {__('A new verification link has been sent to your email address.')}
                            </div>
                        )}
                    </div>
                )}

                <Button disabled={processing}>{__('Save')}</Button>
            </form>
        </section>
    );
}

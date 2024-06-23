import GuestLayout from '@/Layouts/GuestLayout';
import { Button, buttonVariants } from '@/Components/ui';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { __ } = useTraslations();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout title={__('Email Verification')}>
            <div className="mb-4 text-sm text-gray-600">
                {__(
                    "Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another."
                )}
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {__('A new verification link has been sent to the email address you provided during registration.')}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <Button disabled={processing}>{__('Resend Verification Email')}</Button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`${buttonVariants({ variant: 'link' })} pr-0`}
                    >
                        {__('Log Out')}
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

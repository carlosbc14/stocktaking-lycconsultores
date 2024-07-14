import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label, useToast } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Create({ auth }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, post, errors, processing } = useForm({
        rut: '',
        name: '',
        business_sector: '',
        address: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('company.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('company') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Company Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            {__('Complete the requested company information.')}
                        </p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <Label htmlFor="rut">{__('RUT')}</Label>

                            <Input
                                id="rut"
                                className="mt-1 block w-full"
                                value={data.rut}
                                onChange={(e) => setData('rut', e.target.value)}
                                required
                                isFocused
                                autoComplete="rut"
                            />

                            <InputError className="mt-2" message={__(errors.rut)} />
                        </div>

                        <div>
                            <Label htmlFor="name">{__('Name')}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="company"
                            />

                            <InputError className="mt-2" message={__(errors.name)} />
                        </div>

                        <div>
                            <Label htmlFor="business_sector">{__('Business Sector')}</Label>

                            <Input
                                id="business_sector"
                                className="mt-1 block w-full"
                                value={data.business_sector}
                                onChange={(e) => setData('business_sector', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.business_sector)} />
                        </div>

                        <div>
                            <Label htmlFor="address">{__('Address')}</Label>

                            <Input
                                id="address"
                                className="mt-1 block w-full"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.address)} />
                        </div>

                        <Button disabled={processing}>{__('Save')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

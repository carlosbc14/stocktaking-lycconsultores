import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label, useToast } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Create({ auth }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, post, errors, processing } = useForm({
        code: '',
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('warehouses.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('warehouse') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Warehouse Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            {__('Complete the requested warehouse information.')}
                        </p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <Label htmlFor="code">{__('Code')}</Label>

                            <Input
                                id="code"
                                className="mt-1 block w-full"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                required
                                isFocused
                                autoComplete="code"
                            />

                            <InputError className="mt-2" message={__(errors.code)} />
                        </div>

                        <div>
                            <Label htmlFor="name">{__('Name')}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.name)} />
                        </div>

                        <Button disabled={processing}>{__('Save & Continue')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

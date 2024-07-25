import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label, useToast } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';
import ShowWarehouseAisles from './Partials/ShowWarehouseAisles';

export default function Edit({ auth, warehouse }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, patch, errors, processing } = useForm({
        code: warehouse.code,
        name: warehouse.name,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('warehouses.update', warehouse.id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Edit :name', { name: __('warehouse') })}>
            <div className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <section>
                        <header>
                            <h2 className="text-lg font-medium text-gray-900">{__('Warehouse Information')}</h2>

                            <p className="mt-1 text-sm text-gray-600">{__('Update warehouse information.')}</p>
                        </header>

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
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

                                <div className="col-span-2">
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
                            </div>

                            <Button disabled={processing}>{__('Save')}</Button>
                        </form>
                    </section>
                </div>

                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowWarehouseAisles
                        canCreate={auth.user.permissions.some((per) => per.name === 'write warehouses')}
                        canEdit={auth.user.permissions.some((per) => per.name === 'edit warehouses')}
                        canDelete={auth.user.permissions.some((per) => per.name === 'delete warehouses')}
                        warehouse_id={warehouse.id}
                        aisles={warehouse.aisles}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

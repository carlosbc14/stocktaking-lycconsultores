import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label, useToast } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Edit({ auth, product }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, patch, errors, processing } = useForm({
        code_sku: product.code_sku,
        description: product.description,
        institution: product.institution,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('products.update', product.id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Edit :name', { name: __('product') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Product Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Update product information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <Label htmlFor="code_sku">{__('Code')} SKU</Label>

                            <Input
                                id="code_sku"
                                className="mt-1 block w-full"
                                value={data.code_sku}
                                onChange={(e) => setData('code_sku', e.target.value)}
                                required
                                isFocused
                            />

                            <InputError className="mt-2" message={__(errors.code_sku)} />
                        </div>

                        <div>
                            <Label htmlFor="description">{__('Description')}</Label>

                            <Input
                                id="description"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.description)} />
                        </div>

                        <div>
                            <Label htmlFor="institution">{__('Institution')}</Label>

                            <Input
                                id="institution"
                                className="mt-1 block w-full"
                                value={data.institution}
                                onChange={(e) => setData('institution', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.institution)} />
                        </div>

                        <Button disabled={processing}>{__('Save')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

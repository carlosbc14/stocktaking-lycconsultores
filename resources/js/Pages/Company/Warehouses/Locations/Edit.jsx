import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label, useToast } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Edit({ auth, location }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, patch, errors, processing } = useForm({
        line_of_business: location.line_of_business,
        aisle: location.aisle,
        code: location.code,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('locations.update', location.id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Edit :name', { name: __('location') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Location Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Update location information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <Label htmlFor="line_of_business">{__('Line of business')}</Label>

                            <Input
                                id="line_of_business"
                                className="mt-1 block w-full"
                                value={data.line_of_business}
                                onChange={(e) => setData('line_of_business', e.target.value)}
                                required
                                isFocused
                            />

                            <InputError className="mt-2" message={__(errors.line_of_business)} />
                        </div>

                        <div>
                            <Label htmlFor="aisle">{__('Aisle')}</Label>

                            <Input
                                id="aisle"
                                className="mt-1 block w-full"
                                value={data.aisle}
                                onChange={(e) => setData('aisle', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.aisle)} />
                        </div>

                        <div>
                            <Label htmlFor="code">{__('Code')}</Label>

                            <Input
                                id="code"
                                className="mt-1 block w-full"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.code)} />
                        </div>

                        <Button disabled={processing}>{__('Save')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

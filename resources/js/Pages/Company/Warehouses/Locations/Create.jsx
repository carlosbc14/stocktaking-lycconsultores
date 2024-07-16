import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label, useToast } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Create({ auth, warehouse_id }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, post, errors, processing } = useForm({
        warehouse_id,
        locations: [{ line_of_business: '', aisle: '', code: '' }],
    });

    const handleChange = (index, name, value) => {
        const locations = [...data.locations];

        locations[index][name] = value;

        setData('locations', locations);
    };

    const addLocation = () => {
        setData('locations', [...data.locations, { line_of_business: '', aisle: '', code: '' }]);
    };

    const removeLocation = (index) => {
        const locations = [...data.locations];

        locations.splice(index, 1);

        setData('locations', locations);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('locations.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('locations') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Locations Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            {__('Complete the requested locations information.')}
                        </p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        {data.locations.map((lctn, i) => (
                            <div key={i}>
                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-span-6 lg:col-span-3">
                                        <Label htmlFor="line_of_business">{__('Line of business')}</Label>

                                        <Input
                                            id="line_of_business"
                                            className="mt-1 block w-full"
                                            value={lctn.line_of_business}
                                            onChange={(e) => handleChange(i, 'line_of_business', e.target.value)}
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={__(errors[`locations.${i}.line_of_business`])}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label htmlFor="aisle">{__('Aisle')}</Label>

                                        <Input
                                            id="aisle"
                                            className="mt-1 block w-full"
                                            value={lctn.aisle}
                                            onChange={(e) => handleChange(i, 'aisle', e.target.value)}
                                        />

                                        <InputError className="mt-2" message={__(errors[`locations.${i}.aisle`])} />
                                    </div>

                                    <div className="col-span-4 lg:col-span-2">
                                        <Label htmlFor="code">{__('Code')}</Label>

                                        <Input
                                            id="code"
                                            className="mt-1 block w-full"
                                            value={lctn.code}
                                            onChange={(e) => handleChange(i, 'code', e.target.value)}
                                        />

                                        <InputError className="mt-2" message={__(errors[`locations.${i}.code`])} />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removeLocation(i)}
                                        disabled={data.locations.length === 1}
                                    >
                                        {__('Delete')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex">
                            <Button type="submit" disabled={processing}>
                                {__('Save')}
                            </Button>

                            <Button type="button" className="ml-auto" onClick={addLocation}>
                                {__('Add')}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

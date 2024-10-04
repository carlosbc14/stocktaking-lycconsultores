import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Button,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useToast,
} from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Create({ auth, warehouses }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { setData, post, errors, processing } = useForm({
        warehouse_id: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('stocktakings.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('stocktaking') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Stocktaking Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            {__('Complete the requested stocktaking information.')}
                        </p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <Label htmlFor="warehouse">{__('Warehouse')}</Label>

                            <Select id="warehouse" onValueChange={(v) => setData('warehouse_id', v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={__('Select a :name', { name: __('warehouse') })} />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((wrhs) => (
                                        <SelectItem key={wrhs.id} value={wrhs.id.toString()}>
                                            {`(${wrhs.code}) ${wrhs.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={__(errors.warehouse_id)} />
                        </div>

                        <Button disabled={processing}>{__('Save & Continue')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

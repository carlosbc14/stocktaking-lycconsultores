import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    useToast,
} from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Edit({ auth, product, groups }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, patch, errors, processing } = useForm({
        code: product.code,
        description: product.description,
        group_id: product.group_id,
        unit: product.unit,
        origin: product.origin,
        currency: product.currency,
        price: product.price,
        batch: product.batch,
        enabled: product.enabled,
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
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Product Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Update product information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4 lg:col-span-2">
                                <Label htmlFor="code">{__('Code')}</Label>

                                <Input
                                    id="code"
                                    value={data.code}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('code', e.target.value)}
                                />

                                <InputError message={__(errors.code)} className="mt-2" />
                            </div>

                            <div className="col-span-8 lg:col-span-5">
                                <Label htmlFor="description">{__('Description')}</Label>

                                <Input
                                    id="description"
                                    value={data.description}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('description', e.target.value)}
                                />

                                <InputError message={__(errors.description)} className="mt-2" />
                            </div>

                            <div className="col-span-6 lg:col-span-3">
                                <Label htmlFor="group">{__('Group')}</Label>

                                <Select
                                    id="group"
                                    onValueChange={(v) => setData('group_id', v)}
                                    defaultValue={data.group_id ? data.group_id.toString() : ''}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={__('Select a :name', { name: __('group') })} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((grp) => (
                                            <SelectItem key={grp.id} value={grp.id.toString()}>
                                                {grp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <InputError message={__(errors.group_id)} className="mt-2" />
                            </div>

                            <div className="col-span-3 lg:col-span-2">
                                <Label htmlFor="unit">{__('Unit')}</Label>

                                <Input
                                    id="unit"
                                    value={data.unit}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('unit', e.target.value)}
                                />

                                <InputError message={__(errors.unit)} className="mt-2" />
                            </div>

                            <div className="col-span-3 lg:col-span-2">
                                <Label htmlFor="currency">{__('Currency')}</Label>

                                <Input
                                    id="currency"
                                    value={data.currency}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('currency', e.target.value)}
                                />

                                <InputError message={__(errors.currency)} className="mt-2" />
                            </div>

                            <div className="col-span-8 lg:col-span-5">
                                <Label htmlFor="origin">{__('Origin')}</Label>

                                <Input
                                    id="origin"
                                    value={data.origin}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('origin', e.target.value)}
                                />

                                <InputError message={__(errors.origin)} className="mt-2" />
                            </div>

                            <div className="col-span-4 lg:col-span-3">
                                <Label htmlFor="price">{__('Price')}</Label>

                                <Input
                                    id="price"
                                    className="mt-1 block w-full"
                                    type="number"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                />

                                <InputError className="mt-2" message={__(errors.price)} />
                            </div>

                            <div className="col-span-6 lg:col-span-1">
                                <Label htmlFor="batch">{__('Batch')}</Label>

                                <Switch
                                    id="batch"
                                    className="mt-3 block"
                                    checked={data.batch}
                                    onCheckedChange={(v) => setData('batch', v)}
                                />

                                <InputError message={__(errors.batch)} className="mt-2" />
                            </div>

                            <div className="col-span-6 lg:col-span-1">
                                <Label htmlFor="enabled">{__('Enabled')}</Label>

                                <Switch
                                    id="enabled"
                                    className="mt-3 block"
                                    checked={data.enabled}
                                    onCheckedChange={(v) => setData('enabled', v)}
                                />

                                <InputError message={__(errors.enabled)} className="mt-2" />
                            </div>
                        </div>

                        <Button disabled={processing}>{__('Save')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

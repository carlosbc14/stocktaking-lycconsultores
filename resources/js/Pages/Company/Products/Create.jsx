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

export default function Create({ auth, groups }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, post, errors, processing } = useForm({
        products: [
            {
                code: '',
                description: '',
                group_id: '',
                unit: '',
                origin: '',
                currency: '',
                price: '',
                batch: true,
                expiry_date: true,
            },
        ],
    });

    const handleChange = (index, name, value) => {
        const products = [...data.products];

        products[index][name] = value;

        setData('products', products);
    };

    const addProduct = () => {
        setData('products', [
            ...data.products,
            {
                code: '',
                description: '',
                group_id: '',
                unit: '',
                origin: '',
                currency: '',
                price: '',
                batch: true,
                expiry_date: true,
            },
        ]);
    };

    const removeProduct = (index) => {
        const products = [...data.products];

        products.splice(index, 1);

        setData('products', products);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('products.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('products') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Products Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            {__('Complete the requested products information.')}
                        </p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        {data.products.map((prdct, i) => (
                            <div key={i}>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-4 lg:col-span-2">
                                        <Label htmlFor="code">{__('Code')}</Label>

                                        <Input
                                            id="code"
                                            value={prdct.code}
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleChange(i, 'code', e.target.value)}
                                        />

                                        <InputError message={__(errors[`products.${i}.code`])} className="mt-2" />
                                    </div>

                                    <div className="col-span-8 lg:col-span-5">
                                        <Label htmlFor="description">{__('Description')}</Label>

                                        <Input
                                            id="description"
                                            value={prdct.description}
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleChange(i, 'description', e.target.value)}
                                        />

                                        <InputError
                                            message={__(errors[`products.${i}.description`])}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="col-span-6 lg:col-span-3">
                                        <Label htmlFor="group">{__('Group')}</Label>

                                        <Select id="group" onValueChange={(v) => handleChange(i, 'group_id', v)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue
                                                    placeholder={__('Select a :name', { name: __('group') })}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map((grp) => (
                                                    <SelectItem key={grp.id} value={grp.id.toString()}>
                                                        {grp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <InputError message={__(errors[`products.${i}.group_id`])} className="mt-2" />
                                    </div>

                                    <div className="col-span-3 lg:col-span-1">
                                        <Label htmlFor="unit">{__('Unit')}</Label>

                                        <Input
                                            id="unit"
                                            value={prdct.unit}
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleChange(i, 'unit', e.target.value)}
                                        />

                                        <InputError message={__(errors[`products.${i}.unit`])} className="mt-2" />
                                    </div>

                                    <div className="col-span-3 lg:col-span-1">
                                        <Label htmlFor="currency">{__('Currency')}</Label>

                                        <Input
                                            id="currency"
                                            value={prdct.currency}
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleChange(i, 'currency', e.target.value)}
                                        />

                                        <InputError message={__(errors[`products.${i}.currency`])} className="mt-2" />
                                    </div>

                                    <div className="col-span-8 lg:col-span-5">
                                        <Label htmlFor="origin">{__('Origin')}</Label>

                                        <Input
                                            id="origin"
                                            value={prdct.origin}
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleChange(i, 'origin', e.target.value)}
                                        />

                                        <InputError message={__(errors[`products.${i}.origin`])} className="mt-2" />
                                    </div>

                                    <div className="col-span-4 lg:col-span-3">
                                        <Label htmlFor="price">{__('Price')}</Label>

                                        <Input
                                            id="price"
                                            className="mt-1 block w-full"
                                            type="number"
                                            min="0"
                                            value={prdct.price}
                                            onChange={(e) => handleChange(i, 'price', e.target.value)}
                                        />

                                        <InputError className="mt-2" message={__(errors.price)} />
                                    </div>

                                    <div className="col-span-5 lg:col-span-1">
                                        <Label htmlFor="batch">{__('Batch')}</Label>

                                        <Switch
                                            id="batch"
                                            className="mt-3 block"
                                            checked={prdct.batch}
                                            onCheckedChange={(v) => handleChange(i, 'batch', v)}
                                        />

                                        <InputError message={__(errors[`products.${i}.batch`])} className="mt-2" />
                                    </div>

                                    <div className="col-span-7 lg:col-span-3">
                                        <Label htmlFor="expiry_date">{__('Expiry Date')}</Label>

                                        <Switch
                                            id="expiry_date"
                                            className="mt-3 block"
                                            checked={prdct.expiry_date}
                                            onCheckedChange={(v) => handleChange(i, 'expiry_date', v)}
                                        />

                                        <InputError
                                            message={__(errors[`products.${i}.expiry_date`])}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removeProduct(i)}
                                        disabled={data.products.length === 1}
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

                            <Button type="button" className="ml-auto" onClick={addProduct}>
                                {__('Add')}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

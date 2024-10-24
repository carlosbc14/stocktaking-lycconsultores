import axios from 'axios';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    useToast,
} from '@/Components/ui';
import { InputError } from '@/Components';
import { cn } from '@/lib/utils';

export default function Run({ auth, stocktaking, location }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const [scannedProduct, setScannedProduct] = useState();
    const [scanningError, setScanningError] = useState('');
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showExpiryDateModal, setShowExpiryDateModal] = useState(false);
    const [scannedBatch, setScannedBatch] = useState('');
    const [scannedExpiryDate, setScannedExpiryDate] = useState('');
    const { data, setData, post, errors, processing } = useForm({
        products: [
            {
                id: '',
                code: '',
                description: '',
                batch: '',
                expiry_date: '',
                quantity: 1,
            },
        ],
        location_id: location.id,
    });

    const getScannedProduct = async (code) => {
        const response = await axios.get(`/api/stocktakings/scan/${code}`, { withCredentials: true });
        return response.data.product;
    };

    const handleScanExpiryDate = (e) => {
        e.preventDefault();

        addProduct(scannedProduct, data.products.length - 1);

        setShowExpiryDateModal(false);
        setScannedExpiryDate('');
        setScannedBatch('');
    };

    const handleScanBatch = (e) => {
        e.preventDefault();

        setShowBatchModal(false);

        if (scannedProduct.expiry_date) return setShowExpiryDateModal(true);

        setScannedBatch('');
        addProduct(scannedProduct, data.products.length - 1);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            const productIndex = data.products.length - 1;

            if (data.products[productIndex].description) {
                return setData('products', [
                    ...data.products,
                    {
                        id: '',
                        code: '',
                        description: '',
                        batch: '',
                        quantity: 1,
                    },
                ]);
            }

            const product = await getScannedProduct(data.products[productIndex].code);

            setScannedProduct(product);
            setScanningError('');

            if (product.batch) return setShowBatchModal(true);

            if (product.expiry_date) return setShowExpiryDateModal(true);

            addProduct(product, productIndex);
        } catch (error) {
            if (error.response.status === 404) {
                setScanningError(__('The :attribute field value does not exist.', { attribute: __('code') }));
            }
        }
    };

    const handleChange = (index, name, value) => {
        const products = [...data.products];

        products[index][name] = value;

        setData('products', products);
    };

    const addProduct = (product, productIndex) => {
        let scannedExpiryDateFormatted = scannedExpiryDate;
        try {
            scannedExpiryDateFormatted = new Date(scannedExpiryDate).toISOString().split('T')[0];
        } catch (error) {}

        const products = [...data.products];
        const existingProductIndex = products
            .slice(0, -1)
            .findIndex(
                (p) =>
                    p.code === product.code &&
                    (!product.batch || p.batch === scannedBatch) &&
                    (!product.expiry_date || p.expiry_date === scannedExpiryDateFormatted)
            );

        if (existingProductIndex !== -1) {
            products[existingProductIndex].quantity += 1;
            products[productIndex].code = '';
            products[productIndex].description = '';
            products[productIndex].quantity = 1;
        } else {
            products[productIndex].id = product.id;
            products[productIndex].description = product.description;
            if (product.batch) products[productIndex].batch = scannedBatch;
            if (product.expiry_date) products[productIndex].expiry_date = scannedExpiryDateFormatted;

            products.push({
                id: '',
                code: '',
                description: '',
                batch: '',
                expiry_date: '',
                quantity: 1,
            });
        }

        setData('products', products);
        toast({
            title: __('Product Added Successfully'),
        });
    };

    const removeProduct = (index) => {
        const products = [...data.products];

        products.splice(index, 1);

        setData('products', products);
        setScanningError('');
    };

    const handleSubmitProducts = (e) => {
        e.preventDefault();

        if (!data.products[data.products.length - 1].description) {
            setScanningError(__('The :attribute field value does not exist.', { attribute: __('code') }));
        } else {
            post(route('stocktakings.addProduct', stocktaking.id), {
                preserveScroll: true,
                onSuccess: () =>
                    toast({
                        title: __('Saved Successfully'),
                    }),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            title={`${__('Stocktaking')} #${stocktaking.id} (${location.aisle.code}-${location.column}-${
                location.row
            })`}
        >
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{`${__('Stocktaking Information')} (${
                            location.aisle.code
                        }-${location.column}-${location.row})`}</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            {__('Complete the requested products information.')}
                        </p>
                    </header>

                    <form className="mt-6 space-y-6">
                        {data.products.map((prdct, i) => (
                            <div key={i}>
                                <div className="grid grid-cols-12 gap-4">
                                    <div
                                        className={cn(
                                            'col-span-12',
                                            prdct.batch || prdct.expiry_date ? 'lg:col-span-3' : 'lg:col-span-4',
                                            prdct.batch && prdct.expiry_date ? 'lg:col-span-2' : ''
                                        )}
                                    >
                                        <Label htmlFor="code">{__('Code')}</Label>

                                        <Input
                                            id="code"
                                            value={prdct.code}
                                            className="mt-1 block w-full"
                                            onChange={(e) =>
                                                data.products.length - 1 === i
                                                    ? handleChange(i, 'code', e.target.value)
                                                    : null
                                            }
                                            isFocused
                                            disabled={data.products.length - 1 !== i}
                                        />

                                        <InputError
                                            message={__(data.products.length - 1 === i ? scanningError : '')}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div
                                        className={cn(
                                            'col-span-12',
                                            prdct.batch || prdct.expiry_date ? 'lg:col-span-5' : 'lg:col-span-6'
                                        )}
                                    >
                                        <Label htmlFor="description">{__('Description')}</Label>

                                        <Input
                                            id="description"
                                            value={prdct.description}
                                            className="mt-1 block w-full"
                                            disabled
                                        />
                                    </div>

                                    <div
                                        className={cn(
                                            'col-span-12',
                                            prdct.batch || prdct.expiry_date ? 'lg:col-span-1' : 'lg:col-span-2',
                                            prdct.batch && prdct.expiry_date ? 'lg:col-span-1' : ''
                                        )}
                                    >
                                        <Label htmlFor="quantity">{__('Quantity')}</Label>

                                        <Input
                                            id="quantity"
                                            value={prdct.quantity}
                                            className="mt-1 block w-full"
                                            type="number"
                                            min="1"
                                            onChange={(e) => handleChange(i, 'quantity', parseInt(e.target.value))}
                                        />

                                        <InputError message={__(errors[`products.${i}.quantity`])} className="mt-2" />
                                    </div>

                                    <div
                                        className={cn(
                                            'col-span-12',
                                            prdct.expiry_date ? 'lg:col-span-2' : 'lg:col-span-3',
                                            prdct.batch ? '' : 'hidden'
                                        )}
                                    >
                                        <Label htmlFor="batch">{__('Batch')}</Label>

                                        <Input id="batch" value={prdct.batch} className="mt-1 block w-full" disabled />

                                        <InputError message={__(errors[`products.${i}.batch`])} className="mt-2" />
                                    </div>

                                    <div
                                        className={cn(
                                            'col-span-12',
                                            prdct.batch ? 'lg:col-span-2' : 'lg:col-span-3',
                                            prdct.expiry_date ? '' : 'hidden'
                                        )}
                                    >
                                        <Label htmlFor="expiry_date">{__('Expiry Date')}</Label>

                                        <Input
                                            id="expiry_date"
                                            value={prdct.expiry_date}
                                            className="mt-1 block w-full"
                                            disabled
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
                            <Button type="button" onClick={handleSubmitProducts} disabled={processing}>
                                {__('Save')}
                            </Button>

                            <Button type="submit" className="ml-auto" onClick={async (e) => await handleAddProduct(e)}>
                                {__('Add')}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>

            <Dialog open={showBatchModal} onClose={() => setShowBatchModal(false)}>
                <DialogContent>
                    <form className="grid gap-4" onSubmit={handleScanBatch}>
                        <DialogHeader>
                            <DialogTitle>{__('Complete the requested products information.')}</DialogTitle>

                            <DialogDescription>{__('Enter the product batch.')}</DialogDescription>
                        </DialogHeader>

                        <Input
                            id="batch"
                            value={scannedBatch}
                            className="mt-1 block w-full"
                            onChange={(e) => setScannedBatch(e.target.value)}
                            required
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowBatchModal(false)}>
                                {__('Cancel')}
                            </Button>

                            <Button type="submit">{__('Save')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showExpiryDateModal} onClose={() => setShowExpiryDateModal(false)}>
                <DialogContent>
                    <form className="grid gap-4" onSubmit={handleScanExpiryDate}>
                        <DialogHeader>
                            <DialogTitle>{__('Complete the requested products information.')}</DialogTitle>

                            <DialogDescription>{__('Enter the product expiry date.')}</DialogDescription>
                        </DialogHeader>

                        <Input
                            id="expiry_date"
                            value={scannedExpiryDate}
                            className="mt-1 block w-full"
                            onChange={(e) => setScannedExpiryDate(e.target.value)}
                            required
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowExpiryDateModal(false)}>
                                {__('Cancel')}
                            </Button>

                            <Button type="submit">{__('Save')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    useToast,
} from '@/Components/ui';
import LocationTable from '@/Components/LocationTable';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function SelectLocation({ auth, stocktaking }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const [locations, setLocations] = useState([]);
    const { data, setData, post, errors, processing } = useForm({ observations: '' });

    const finalizeStocktaking = () => {
        post(route('stocktakings.finalize', stocktaking.id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Select :name', { name: __('Location') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Stocktaking Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            {__('Complete the requested stocktaking information.')}
                        </p>
                        <div className="flex justify-end">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>{__('Finalize :name', { name: __('stocktaking') })}</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {__('Are you sure you want to finalize the stocktaking :name?', {
                                                name: `#${stocktaking.id}`,
                                            })}
                                        </DialogTitle>

                                        <DialogDescription>{__('Enter stocktacking observations.')}</DialogDescription>
                                    </DialogHeader>

                                    <Textarea
                                        id="observations"
                                        className="mt-1"
                                        value={data.observations}
                                        onChange={(e) => setData('observations', e.target.value)}
                                    />

                                    <InputError message={__(errors.observations)} className="mt-2" />

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">{__('Cancel')}</Button>
                                        </DialogClose>

                                        <Button onClick={finalizeStocktaking} disabled={processing}>
                                            {__('Finalize')}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </header>

                    <form className="mt-6 space-y-6">
                        <div className="max-w-xl">
                            <Label htmlFor="aisle">{__('Aisle')}</Label>

                            <Select
                                id="aisle"
                                onValueChange={(v) =>
                                    setLocations(
                                        stocktaking.warehouse.aisles.find((a) => a.id === Number(v))?.locations
                                    )
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={__('Select a :name', { name: __('aisle') })} />
                                </SelectTrigger>
                                <SelectContent>
                                    {stocktaking.warehouse.aisles.map((asl) => (
                                        <SelectItem key={asl.id} value={asl.id.toString()}>
                                            {asl.code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="location">{__('Location')}</Label>

                            <LocationTable className="mt-1" stocktakingId={stocktaking.id} locations={locations} />
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

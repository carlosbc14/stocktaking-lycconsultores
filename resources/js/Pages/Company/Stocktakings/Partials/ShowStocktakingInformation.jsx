import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label, Textarea } from '@/Components/ui';
import { Link } from '@inertiajs/react';

export default function ShowStocktakingInformation({ stocktaking, canEdit = false, className = '' }) {
    const { __ } = useTraslations();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Stocktaking Information')}</h2>

                {canEdit && (
                    <div className="flex justify-end">
                        <Link href={route('stocktakings.edit', stocktaking.id)}>
                            <Button>{__('Edit :name', { name: __('stocktaking') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <Label htmlFor="id">{__('ID')}</Label>

                    <Input id="id" className="mt-1 block w-full" value={stocktaking.id} disabled />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="warehouse">{__('Warehouse')}</Label>

                    <Input id="warehouse" className="mt-1 block w-full" value={stocktaking.warehouse?.name} disabled />
                </div>

                {stocktaking.observations && (
                    <div className="col-span-3">
                        <Label htmlFor="observations">{__('Observations')}</Label>

                        <Textarea id="observations" className="mt-1" value={stocktaking.observations} disabled />
                    </div>
                )}
            </div>
        </section>
    );
}

import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label } from '@/Components/ui';
import { Link } from '@inertiajs/react';

export default function ShowWarehouseInformation({ warehouse, canEdit = false, className = '' }) {
    const { __ } = useTraslations();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Warehouse Information')}</h2>

                {canEdit && (
                    <div className="flex justify-end">
                        <Link href={route('warehouses.edit')}>
                            <Button>{__('Edit :name', { name: __('warehouse') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <div className="mt-6 space-y-6 max-w-xl">
                <div>
                    <Label htmlFor="code">{__('Code')}</Label>

                    <Input id="code" className="mt-1 block w-full" value={warehouse.code} disabled />
                </div>

                <div>
                    <Label htmlFor="name">{__('Name')}</Label>

                    <Input id="name" className="mt-1 block w-full" value={warehouse.name} disabled />
                </div>
            </div>
        </section>
    );
}

import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button } from '@/Components/ui';
import { DataTable } from '@/Components';
import { ArrowUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ShowStocktakingProducts({
    stocktakingId,
    products = [],
    stocktakingFinished = false,
    canCreate = false,
    className = '',
}) {
    const { locale, __ } = useTraslations();

    const columns = [
        {
            accessorKey: 'code',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Code')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'pivot.batch',
            header: <div className="uppercase">{__('Batch')}</div>,
            cell: ({ row }) => row.original.pivot.batch ?? '-',
        },
        {
            accessorKey: 'pivot.quantity',
            header: <div className="uppercase">{__('Quantity')}</div>,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Description')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'pivot.expiry_date',
            header: <div className="uppercase">{__('Expiry Date')}</div>,
            cell: ({ row }) =>
                row.original.pivot.expiry_date ? new Date(row.original.pivot.expiry_date).toLocaleString(locale) : '-',
        },
        {
            accessorKey: 'location',
            header: <div className="uppercase">{__('Location')}</div>,
            cell: ({ row }) =>
                row.original.pivot.location
                    ? `${row.original.pivot.location.aisle.code}-${row.original.pivot.location.column}-${row.original.pivot.location.row}`
                    : '-',
        },
    ];

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Stocktaking Products')}</h2>

                {stocktakingFinished && (
                    <div className="flex justify-end">
                        <a href={route('stocktakings.export', stocktakingId)}>
                            <Button>{__('Export :name', { name: __('stocktaking') })}</Button>
                        </a>
                    </div>
                )}

                {canCreate && !stocktakingFinished && (
                    <div className="flex justify-end">
                        <Link href={route('stocktakings.selectLocation', stocktakingId)}>
                            <Button>{__('Continue :name', { name: __('stocktaking') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <DataTable data={products} columns={columns} filterBy="description" />
        </section>
    );
}

import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, buttonVariants } from '@/Components/ui';
import { DataTable } from '@/Components';
import { ArrowUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ShowStocktakingLocationProducts({
    stocktakingId,
    locationId,
    products = [],
    canReset = false,
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
    ];

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Stocktaking Products')}</h2>

                {canReset && (
                    <div className="flex justify-end">
                        <Link
                            href={route('stocktakings.resetLocation', {
                                stocktaking: stocktakingId,
                                location: locationId,
                            })}
                            method="post"
                            as="button"
                            className={buttonVariants({ variant: 'default' })}
                            onClick={(e) => (e.target.disabled = true)}
                        >
                            {__('Reset :name', { name: __('stocktaking') })}
                        </Link>
                    </div>
                )}
            </header>

            <DataTable data={products} columns={columns} filterBy="description" />
        </section>
    );
}

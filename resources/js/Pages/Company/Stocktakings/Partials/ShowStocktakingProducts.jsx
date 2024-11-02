import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button } from '@/Components/ui';
import { DataTable } from '@/Components';
import { ArrowUpDown } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ShowStocktakingProducts({
    stocktakingId,
    products = [],
    stocktakingFinished = false,
    canCreate = false,
    className = '',
}) {
    const { __ } = useTraslations();

    const [filterBy, setFilterBy] = useState();
    const [filterValue, setFilterValue] = useState();
    const [sortBy, setSortBy] = useState();
    const [sortDirection, setSortDirection] = useState();
    const [currentPage, setCurrentPage] = useState(products.current_page);
    const [pageSize, setPageSize] = useState(products.per_page);

    const columns = [
        {
            id: 'group.name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Group')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (row.original.group ? row.original.group.name : '-'),
        },
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
            accessorKey: 'description',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Description')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            id: 'pivot.batch',
            header: <div className="uppercase">{__('Batch')}</div>,
            cell: ({ row }) => row.original.pivot.batch ?? '-',
        },
        {
            id: 'pivot.expiry_date',
            header: <div className="uppercase">{__('Expiry Date')}</div>,
            cell: ({ row }) => row.original.pivot.expiry_date ?? '-',
        },
        {
            id: 'pivot.quantity',
            header: <div className="uppercase">{__('Quantity')}</div>,
            cell: ({ row }) => row.original.pivot.quantity ?? '-',
        },
        {
            accessorKey: 'price',
            header: <div className="uppercase">{__('Unit Price')}</div>,
            cell: ({ row }) => row.original.price?.toLocaleString() ?? '-',
        },
        {
            accessorKey: 'total_price',
            header: <div className="uppercase">{__('Total')}</div>,
            cell: ({ row }) =>
                row.original.price ? (row.original.price * row.original.pivot.quantity).toLocaleString() : '-',
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

    const handleFilterChange = (field, value) => {
        setFilterBy(field);
        setFilterValue(value);

        router.visit(
            route('stocktakings.show', {
                stocktaking: stocktakingId,
                filterBy: field,
                filterValue: value,
                sortBy,
                sortDirection,
                page: currentPage,
                perPage: pageSize,
            }),
            { preserveState: true }
        );
    };

    const handleSortChange = (field, desc) => {
        const direction = desc ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(direction);

        router.visit(
            route('stocktakings.show', {
                stocktaking: stocktakingId,
                filterBy,
                filterValue,
                sortBy: field,
                sortDirection: direction,
                page: currentPage,
                perPage: pageSize,
            }),
            { preserveState: true }
        );
    };

    const handlePageChange = (page, perPage) => {
        setCurrentPage(page);
        setPageSize(perPage);

        router.visit(
            route('stocktakings.show', {
                stocktaking: stocktakingId,
                filterBy,
                filterValue,
                sortBy,
                sortDirection,
                page,
                perPage,
            }),
            { preserveState: true }
        );
    };

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

            <DataTable
                data={products.data}
                columns={columns}
                filterBy="description"
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                totalPages={products.last_page}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                currentPage={currentPage}
            />
        </section>
    );
}

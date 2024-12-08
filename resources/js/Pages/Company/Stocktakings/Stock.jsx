import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Button,
    buttonVariants,
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    useToast,
} from '@/Components/ui';
import { Link, router, useForm } from '@inertiajs/react';
import { DataTable, InputError } from '@/Components';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

export default function Stock({ auth, stocktakingId, products, failures }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const [filterBy, setFilterBy] = useState();
    const [filterValue, setFilterValue] = useState();
    const [sortBy, setSortBy] = useState();
    const [sortDirection, setSortDirection] = useState();
    const [currentPage, setCurrentPage] = useState(products.current_page);
    const [pageSize, setPageSize] = useState(products.per_page);

    const { setData, post, errors, processing } = useForm({ excel: null });

    const columns = [
        {
            accessorKey: 'code',
            header: <div className="uppercase">{__('Code')}</div>,
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
            id: 'pivot.stock',
            header: <div className="uppercase">{__('Stock')}</div>,
            cell: ({ row }) => row.original.pivot.stock ?? '-',
        },
    ];

    const handleImport = () => {
        post(route('stocktakings.importStock', stocktakingId), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Import completed'),
                }),
        });
    };

    const handleFilterChange = (field, value) => {
        setFilterBy(field);
        setFilterValue(value);

        router.visit(
            route('stocktakings.stock', {
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
            route('stocktakings.stock', {
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
            route('stocktakings.stock', {
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
        <AuthenticatedLayout user={auth.user} title={__('Stock Products')}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <div className="flex justify-end gap-4 mb-6">
                    {products.data.length > 0 ? (
                        <>
                            <a href={route('stocktakings.exportComparison', stocktakingId)}>
                                <Button>{__('Export :name', { name: __('stocktaking comparison') })}</Button>
                            </a>

                            <Link
                                href={route('stocktakings.resetStock', stocktakingId)}
                                method="post"
                                as="button"
                                className={buttonVariants({ variant: 'default' })}
                                onClick={(e) => (e.target.disabled = true)}
                            >
                                {__('Reset :name', { name: __('stock products') })}
                            </Link>
                        </>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>{__('Import :name', { name: __('stock products') })}</Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined}>
                                <DialogHeader>
                                    <DialogTitle>{__('Upload Excel')}</DialogTitle>
                                </DialogHeader>

                                <Input
                                    id="excel"
                                    type="file"
                                    onChange={(e) => setData('excel', e.target.files[0] ?? null)}
                                />

                                <InputError message={__(errors.excel)} className="mt-2" />

                                {failures?.length > 0 && (
                                    <InputError
                                        message={__('Rows :rows were not imported.', { rows: failures.join(', ') })}
                                        className="max-h-40 overflow-y-auto mt-2"
                                    />
                                )}

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">{__('Cancel')}</Button>
                                    </DialogClose>
                                    <Button onClick={handleImport} disabled={processing}>
                                        {__('Load')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

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
            </div>
        </AuthenticatedLayout>
    );
}

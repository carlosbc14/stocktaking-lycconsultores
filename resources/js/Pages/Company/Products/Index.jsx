import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    buttonVariants,
    useToast,
    Label,
    Switch,
} from '@/Components/ui';
import { Link, router, useForm } from '@inertiajs/react';
import { DataTable, InputError } from '@/Components';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, products, failures }) {
    const { locale, __ } = useTraslations();
    const { toast } = useToast();

    const [filterBy, setFilterBy] = useState();
    const [filterValue, setFilterValue] = useState();
    const [sortBy, setSortBy] = useState();
    const [sortDirection, setSortDirection] = useState();
    const [currentPage, setCurrentPage] = useState(products.current_page);
    const [pageSize, setPageSize] = useState(products.per_page);
    const [selectedColumns, setSelectedColumns] = useState({
        description: true,
        group: true,
        unit: true,
        origin: true,
        currency: true,
        price: true,
        batch: true,
        expiry_date: true,
        enabled: true,
    });

    const { setData, post, errors, processing } = useForm({ excel: null });

    const canCreate = auth.user.permissions.some((per) => per.name === 'write products');
    const canEdit = auth.user.permissions.some((per) => per.name === 'edit products');
    const canDelete = auth.user.permissions.some((per) => per.name === 'delete products');

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
            accessorKey: 'unit',
            header: <div className="uppercase">{__('Unit')}</div>,
            cell: ({ row }) => row.original.unit ?? '-',
        },
        {
            accessorKey: 'origin',
            header: <div className="uppercase">{__('Origin')}</div>,
            cell: ({ row }) => row.original.origin ?? '-',
        },
        {
            accessorKey: 'currency',
            header: <div className="uppercase">{__('Currency')}</div>,
            cell: ({ row }) => row.original.currency ?? '-',
        },
        {
            accessorKey: 'price',
            header: <div className="uppercase">{__('Price')}</div>,
            cell: ({ row }) => row.original.price?.toLocaleString(locale) ?? '-',
        },
        {
            accessorKey: 'batch',
            header: <div className="uppercase">{__('Batch')}</div>,
            cell: ({ row }) => (row.original.batch ? __('Yes') : __('No')),
        },
        {
            accessorKey: 'expiry_date',
            header: <div className="uppercase">{__('Expiry Date')}</div>,
            cell: ({ row }) => (row.original.expiry_date ? __('Yes') : __('No')),
        },
    ];

    if (canEdit || canDelete) {
        columns.push({
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const product = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <Link href={route('products.edit', product.id)} className="w-full">
                                    <DropdownMenuItem>
                                        <Pencil className="mr-2 h-4 w-4" /> {__('Edit')}
                                    </DropdownMenuItem>
                                </Link>
                            )}
                            {canDelete && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" /> {__('Delete')}
                                        </DropdownMenuItem>
                                    </DialogTrigger>
                                    <DialogContent aria-describedby={undefined}>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {__('Are you sure you want to delete the product :name?', {
                                                    name: product.code,
                                                })}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{__('Cancel')}</Button>
                                            </DialogClose>
                                            <Link
                                                href={route('products.destroy', product.id)}
                                                method="delete"
                                                as="Button"
                                                className={buttonVariants({ variant: 'destructive' })}
                                                onClick={(e) => (e.target.disabled = true)}
                                            >
                                                {__('Delete')}
                                            </Link>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        });
    }

    const handleImport = () => {
        post(route('products.import'), {
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
            route('products.index', {
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
            route('products.index', {
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
            route('products.index', {
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
        <AuthenticatedLayout user={auth.user} title={__('Products')}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                {canCreate && (
                    <div className="flex justify-end gap-4 mb-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>{__('Export :name', { name: __('products') })}</Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined}>
                                <DialogHeader>
                                    <DialogTitle>{__('Choose :name', { name: __('Columns') })}</DialogTitle>
                                </DialogHeader>

                                <div className="flex items-center space-x-2">
                                    <Switch name="code" checked disabled />
                                    <Label htmlFor="code" className="ms-2">
                                        {__('Code')}
                                    </Label>
                                </div>

                                <div className="flex items-center">
                                    <Switch
                                        name="description"
                                        checked={selectedColumns.description}
                                        onCheckedChange={(v) =>
                                            setSelectedColumns({ ...selectedColumns, description: v })
                                        }
                                    />
                                    <Label htmlFor="description" className="ms-2">
                                        {__('Description')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="group"
                                        checked={selectedColumns.group}
                                        onCheckedChange={(v) => setSelectedColumns({ ...selectedColumns, group: v })}
                                    />
                                    <Label htmlFor="group" className="ms-2">
                                        {__('Group')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="unit"
                                        checked={selectedColumns.unit}
                                        onCheckedChange={(v) => setSelectedColumns({ ...selectedColumns, unit: v })}
                                    />
                                    <Label htmlFor="unit" className="ms-2">
                                        {__('Unit')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="origin"
                                        checked={selectedColumns.origin}
                                        onCheckedChange={(v) => setSelectedColumns({ ...selectedColumns, origin: v })}
                                    />
                                    <Label htmlFor="origin" className="ms-2">
                                        {__('Origin')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="currency"
                                        checked={selectedColumns.currency}
                                        onCheckedChange={(v) => setSelectedColumns({ ...selectedColumns, currency: v })}
                                    />
                                    <Label htmlFor="currency" className="ms-2">
                                        {__('Currency')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="price"
                                        checked={selectedColumns.price}
                                        onCheckedChange={(v) => setSelectedColumns({ ...selectedColumns, price: v })}
                                    />
                                    <Label htmlFor="price" className="ms-2">
                                        {__('Price')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="batch"
                                        checked={selectedColumns.batch}
                                        onCheckedChange={(v) => setSelectedColumns({ ...selectedColumns, batch: v })}
                                    />
                                    <Label htmlFor="batch" className="ms-2">
                                        {__('Batch')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="expiry_date"
                                        checked={selectedColumns.expiry_date}
                                        onCheckedChange={(v) =>
                                            setSelectedColumns({ ...selectedColumns, expiry_date: v })
                                        }
                                    />
                                    <Label htmlFor="expiry_date" className="ms-2">
                                        {__('Expiry Date')}
                                    </Label>
                                </div>

                                <div className="flex">
                                    <Switch
                                        name="enabled"
                                        checked={selectedColumns.enabled}
                                        onCheckedChange={(v) => setSelectedColumns({ ...selectedColumns, enabled: v })}
                                    />
                                    <Label htmlFor="enabled" className="ms-2">
                                        {__('Enabled')}
                                    </Label>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">{__('Cancel')}</Button>
                                    </DialogClose>
                                    <a href={route('products.export', { columns: selectedColumns })}>
                                        <Button>{__('Export :name', { name: __('products') })}</Button>
                                    </a>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>{__('Import :name', { name: __('products') })}</Button>
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

                                {failures.length > 0 && (
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

                        <Link href={route('products.create')}>
                            <Button>{__('Add :name', { name: __('products') })}</Button>
                        </Link>
                    </div>
                )}

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

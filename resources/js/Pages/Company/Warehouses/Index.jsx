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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    buttonVariants,
} from '@/Components/ui';
import { Link, router } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/Components';
import { useState } from 'react';

export default function Index({ auth, warehouses }) {
    const { __ } = useTraslations();

    const [filterBy, setFilterBy] = useState();
    const [filterValue, setFilterValue] = useState();
    const [sortBy, setSortBy] = useState();
    const [sortDirection, setSortDirection] = useState();
    const [currentPage, setCurrentPage] = useState(warehouses.current_page);
    const [pageSize, setPageSize] = useState(warehouses.per_page);

    const canCreate = auth.user.permissions.some((per) => per.name === 'write warehouses');
    const canEdit = auth.user.permissions.some((per) => per.name === 'edit warehouses');
    const canDelete = auth.user.permissions.some((per) => per.name === 'delete warehouses');

    const columns = [
        {
            accessorKey: 'code',
            header: <div className="uppercase">{__('Code')}</div>,
            cell: ({ row }) => {
                const warehouse = row.original;

                return (
                    <Link
                        href={route('warehouses.show', warehouse.id)}
                        className={`${buttonVariants({ variant: 'link' })} pr-0`}
                    >
                        {warehouse.code}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const warehouse = row.original;

                return (
                    <Link
                        href={route('warehouses.show', warehouse.id)}
                        className={`${buttonVariants({ variant: 'link' })} pr-0`}
                    >
                        {warehouse.name}
                    </Link>
                );
            },
        },
    ];

    if (canEdit || canDelete) {
        columns.push({
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const warehouse = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <Link href={route('warehouses.edit', warehouse.id)} className="w-full">
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
                                                {__('Are you sure you want to delete the warehouse :name?', {
                                                    name: warehouse.name,
                                                })}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{__('Cancel')}</Button>
                                            </DialogClose>
                                            <Link
                                                href={route('warehouses.destroy', warehouse.id)}
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

    const handleFilterChange = (field, value) => {
        setFilterBy(field);
        setFilterValue(value);

        router.visit(
            route('warehouses.index', {
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
            route('warehouses.index', {
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
            route('warehouses.index', {
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
        <AuthenticatedLayout user={auth.user} title={__('Warehouses')}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                {canCreate && (
                    <div className="flex justify-end mb-6">
                        <Link href={route('warehouses.create')}>
                            <Button>{__('Add :name', { name: __('warehouse') })}</Button>
                        </Link>
                    </div>
                )}

                <DataTable
                    data={warehouses.data}
                    columns={columns}
                    filterBy="name"
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    totalPages={warehouses.last_page}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    currentPage={currentPage}
                />
            </div>
        </AuthenticatedLayout>
    );
}

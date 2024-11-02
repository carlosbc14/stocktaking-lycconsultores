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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui';
import { Link, router } from '@inertiajs/react';
import { DataTable } from '@/Components';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ShowCompanyUsers({
    users = [],
    canCreate = false,
    canEdit = false,
    canDelete = false,
    className = '',
}) {
    const { __ } = useTraslations();

    const [filterBy, setFilterBy] = useState();
    const [filterValue, setFilterValue] = useState();
    const [sortBy, setSortBy] = useState();
    const [sortDirection, setSortDirection] = useState();
    const [currentPage, setCurrentPage] = useState(users.current_page);
    const [pageSize, setPageSize] = useState(users.per_page);

    const columns = [
        {
            accessorKey: 'rut',
            header: 'RUT',
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Email')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
        },
        {
            id: 'role.name',
            header: () => <div className="uppercase">{__('Role')}</div>,
            cell: ({ row }) => <div className="uppercase">{__(row.original.role.name.replace('_', ' '))}</div>,
        },
    ];

    if (canEdit || canDelete) {
        columns.push({
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;

                if (!user.permissions.canEdit && !user.permissions.canDelete) return;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && user.permissions.canEdit && (
                                <Link href={route('company.users.edit', user.id)} className="w-full">
                                    <DropdownMenuItem>
                                        <Pencil className="mr-2 h-4 w-4" /> {__('Edit')}
                                    </DropdownMenuItem>
                                </Link>
                            )}
                            {canDelete && user.permissions.canDelete && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" /> {__('Delete')}
                                        </DropdownMenuItem>
                                    </DialogTrigger>
                                    <DialogContent aria-describedby={undefined}>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {__('Are you sure you want to delete the user :name?', {
                                                    name: user.rut,
                                                })}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{__('Cancel')}</Button>
                                            </DialogClose>
                                            <Link
                                                href={route('company.users.destroy', user.id)}
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
            route('company.show', {
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
            route('company.show', {
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
            route('company.show', {
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
                <h2 className="text-lg font-medium text-gray-900">{__('Company Users')}</h2>

                {canCreate && (
                    <div className="flex justify-end">
                        <Link href={route('company.users.create')}>
                            <Button>{__('Add :name', { name: __('user') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <DataTable
                data={users.data}
                columns={columns}
                filterBy="name"
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                totalPages={users.last_page}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                currentPage={currentPage}
            />
        </section>
    );
}

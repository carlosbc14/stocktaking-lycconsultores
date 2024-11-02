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
import { DataTable } from '@/Components';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, groups }) {
    const { __ } = useTraslations();

    const [filterBy, setFilterBy] = useState();
    const [filterValue, setFilterValue] = useState();
    const [sortBy, setSortBy] = useState();
    const [sortDirection, setSortDirection] = useState();
    const [currentPage, setCurrentPage] = useState(groups.current_page);
    const [pageSize, setPageSize] = useState(groups.per_page);

    const canCreate = auth.user.permissions.some((per) => per.name === 'write groups');
    const canEdit = auth.user.permissions.some((per) => per.name === 'edit groups');
    const canDelete = auth.user.permissions.some((per) => per.name === 'delete groups');

    const columns = [
        {
            id: 'parentGroup.name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Parent Group')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (row.original.parent_group ? row.original.parent_group.name : '-'),
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
    ];

    if (canEdit || canDelete) {
        columns.push({
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const group = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <Link href={route('groups.edit', group.id)} className="w-full">
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
                                                {__('Are you sure you want to delete the group :name?', {
                                                    name: group.name,
                                                })}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{__('Cancel')}</Button>
                                            </DialogClose>
                                            <Link
                                                href={route('groups.destroy', group.id)}
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
            route('groups.index', {
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
            route('groups.index', {
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
            route('groups.index', {
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
        <AuthenticatedLayout user={auth.user} title={__('Groups')}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                {canCreate && (
                    <div className="flex justify-end mb-6">
                        <Link href={route('groups.create')}>
                            <Button>{__('Add :name', { name: __('group') })}</Button>
                        </Link>
                    </div>
                )}

                <DataTable
                    data={groups.data}
                    columns={columns}
                    filterBy="name"
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    totalPages={groups.last_page}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    currentPage={currentPage}
                />
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Badge,
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
import { Link } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/Components';

export default function Index({ auth, stocktakings }) {
    const { locale, __ } = useTraslations();

    const canCreate = auth.user.permissions.some((per) => per.name === 'write stocktakings');
    const canEdit = auth.user.permissions.some((per) => per.name === 'edit stocktakings');
    const canDelete = auth.user.permissions.some((per) => per.name === 'delete stocktakings');

    const columns = [
        {
            accessorKey: 'id',
            header: <div className="uppercase">{__('ID')}</div>,
            cell: ({ row }) => {
                const stocktaking = row.original;

                return (
                    <Link
                        href={route('stocktakings.show', stocktaking.id)}
                        className={`${buttonVariants({ variant: 'link' })} pr-0`}
                    >
                        {stocktaking.id}
                    </Link>
                );
            },
        },
        {
            accessorKey: 'warehouse.name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Warehouse')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.warehouse?.name,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('Date')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{new Date(row.getValue('created_at')).toLocaleString(locale)}</div>,
        },
        {
            accessorKey: 'user.name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {__('operator')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.user?.name,
        },
        {
            accessorKey: 'finished_at',
            header: <div className="uppercase">{__('State')}</div>,
            cell: ({ row }) =>
                row.getValue('finished_at') ? (
                    <Badge>{__('Finished')}</Badge>
                ) : (
                    <Badge variant="outline">{__('In Process')}</Badge>
                ),
        },
    ];

    if (canEdit || canDelete) {
        columns.push({
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const stocktaking = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <Link href={route('stocktakings.edit', stocktaking.id)} className="w-full">
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
                                                {__('Are you sure you want to delete the stocktaking :name?', {
                                                    name: `#${stocktaking.id}`,
                                                })}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{__('Cancel')}</Button>
                                            </DialogClose>
                                            <Link
                                                href={route('stocktakings.destroy', stocktaking.id)}
                                                method="delete"
                                                as="button"
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

    return (
        <AuthenticatedLayout user={auth.user} title={__('Stocktakings')}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                {canCreate && (
                    <div className="flex justify-end mb-6">
                        <Link href={route('stocktakings.create')}>
                            <Button>{__('Add :name', { name: __('stocktaking') })}</Button>
                        </Link>
                    </div>
                )}

                <DataTable data={stocktakings} columns={columns} filterBy="id" />
            </div>
        </AuthenticatedLayout>
    );
}
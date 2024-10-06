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
import { Link } from '@inertiajs/react';
import { DataTable } from '@/Components';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export default function ShowWarehouseAisles({
    warehouse_id = null,
    aisles = [],
    canCreate = false,
    canEdit = false,
    canDelete = false,
    className = '',
}) {
    const { __ } = useTraslations();

    const columns = [
        {
            accessorKey: 'group.name',
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
            id: 'columns',
            header: <div className="uppercase">{__('Columns')}</div>,
            cell: ({ row }) => {
                let columns = 0;
                for (let location of row.original.locations) {
                    if (location.column > columns) columns = location.column;
                }

                return columns;
            },
        },
        {
            id: 'rows',
            header: <div className="uppercase">{__('Rows')}</div>,
            cell: ({ row }) => {
                let rows = 0;
                for (let location of row.original.locations) {
                    if (location.row > rows) rows = location.row;
                }

                return rows;
            },
        },
    ];

    if (canEdit || canDelete) {
        columns.push({
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const aisle = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <Link href={route('warehouses.aisles.edit', aisle.id)} className="w-full">
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
                                                {__('Are you sure you want to delete the aisle :name?', {
                                                    name: aisle.code,
                                                })}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">{__('Cancel')}</Button>
                                            </DialogClose>
                                            <Link
                                                href={route('warehouses.aisles.destroy', aisle.id)}
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

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Warehouse Aisles')}</h2>

                {canCreate && (
                    <div className="flex justify-end">
                        <Link href={route('warehouses.aisles.create', { warehouse_id })}>
                            <Button>{__('Add :name', { name: __('aisles') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <DataTable data={aisles} columns={columns} filterBy="code" />
        </section>
    );
}

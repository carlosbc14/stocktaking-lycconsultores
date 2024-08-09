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
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui';
import { Link } from '@inertiajs/react';

export default function ShowWarehouseAisles({
    warehouse_id = null,
    aisles = [],
    canCreate = false,
    canEdit = false,
    canDelete = false,
    className = '',
}) {
    const { __ } = useTraslations();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Warehouse Aisles')}</h2>

                {canCreate && (
                    <div className="flex justify-end">
                        <Link href={route('aisles.create', { warehouse_id })}>
                            <Button>{__('Add :name', { name: __('aisles') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <Table className="mt-6">
                {!aisles.length && <TableCaption>{__('No Content')}</TableCaption>}
                <TableHeader>
                    <TableRow>
                        <TableHead>{__('Group')}</TableHead>
                        <TableHead className="w-28">{__('Code')}</TableHead>
                        <TableHead className="w-28">{__('Columns')}</TableHead>
                        <TableHead className="w-28">{__('Rows')}</TableHead>
                        {(canEdit || canDelete) && <TableHead className="w-56">{__('Options')}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {aisles.map((asl) => {
                        let columns = 0,
                            rows = 0;
                        for (let location of asl.locations) {
                            if (location.column > columns) columns = location.column;
                            if (location.row > rows) rows = location.row;
                        }
                        return (
                            <TableRow key={asl.id}>
                                <TableCell>{asl.group ? asl.group.name : '-'}</TableCell>
                                <TableCell>{asl.code}</TableCell>
                                <TableCell>{columns}</TableCell>
                                <TableCell>{rows}</TableCell>
                                {(canEdit || canDelete) && (
                                    <TableCell>
                                        {canEdit && (
                                            <Link href={route('aisles.edit', asl.id)}>
                                                <Button className="mr-2">{__('Edit')}</Button>
                                            </Link>
                                        )}
                                        {canDelete && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="destructive">{__('Delete')}</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            {__('Are you sure you want to delete the aisle :name?', {
                                                                name: asl.code,
                                                            })}
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">{__('Cancel')}</Button>
                                                        </DialogClose>
                                                        <Link
                                                            href={route('aisles.destroy', asl.id)}
                                                            method="delete"
                                                            as="Button"
                                                            className={buttonVariants({ variant: 'destructive' })}
                                                        >
                                                            {__('Delete')}
                                                        </Link>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </section>
    );
}

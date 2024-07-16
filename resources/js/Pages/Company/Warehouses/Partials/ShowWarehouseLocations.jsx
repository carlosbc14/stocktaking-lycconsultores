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

export default function ShowWarehouseLocations({
    warehouse_id = null,
    locations = [],
    canCreate = false,
    canEdit = false,
    canDelete = false,
    className = '',
}) {
    const { __ } = useTraslations();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Warehouse Locations')}</h2>

                {canCreate && (
                    <div className="flex justify-end">
                        <Link href={route('locations.create', { warehouse_id })}>
                            <Button>{__('Add :name', { name: __('locations') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <Table className="mt-6">
                {!locations.length && <TableCaption>{__('No Content')}</TableCaption>}
                <TableHeader>
                    <TableRow>
                        <TableHead>{__('Line of business')}</TableHead>
                        <TableHead>{__('Aisle')}</TableHead>
                        <TableHead className="w-28">{__('Code')}</TableHead>
                        {(canEdit || canDelete) && <TableHead className="w-56">{__('Options')}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations.map((lctn) => (
                        <TableRow key={lctn.id}>
                            <TableCell>{lctn.line_of_business}</TableCell>
                            <TableCell>{lctn.aisle}</TableCell>
                            <TableCell className="font-medium">{lctn.code}</TableCell>
                            {(canEdit || canDelete) && (
                                <TableCell>
                                    {canEdit && (
                                        <Link href={route('locations.edit', lctn.id)}>
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
                                                        {__('Are you sure you want to delete the location :name?', {
                                                            name: lctn.code,
                                                        })}
                                                    </DialogTitle>
                                                </DialogHeader>

                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">{__('Cancel')}</Button>
                                                    </DialogClose>
                                                    <Link
                                                        href={route('locations.destroy', lctn.id)}
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
                    ))}
                </TableBody>
            </Table>
        </section>
    );
}

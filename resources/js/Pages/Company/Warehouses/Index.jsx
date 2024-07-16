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
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    buttonVariants,
} from '@/Components/ui';
import { Link } from '@inertiajs/react';

export default function Index({ auth, warehouses }) {
    const { __ } = useTraslations();

    const canCreate = auth.user.permissions.some((per) => per.name === 'write warehouses');
    const canEdit = auth.user.permissions.some((per) => per.name === 'edit warehouses');
    const canDelete = auth.user.permissions.some((per) => per.name === 'delete warehouses');

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
                <Table>
                    {!warehouses.length && <TableCaption>{__('No Content')}</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            <TableHead>{__('Code')}</TableHead>
                            <TableHead>{__('Name')}</TableHead>
                            {(canEdit || canDelete) && <TableHead className="w-56">{__('Options')}</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {warehouses.map((wrhs) => (
                            <TableRow key={wrhs.id}>
                                <TableCell className="font-medium">
                                    <Link href={route('warehouses.show', wrhs.id)}>{wrhs.code}</Link>
                                </TableCell>
                                <TableCell>
                                    <Link href={route('warehouses.show', wrhs.id)}>{wrhs.name}</Link>
                                </TableCell>
                                {(canEdit || canDelete) && (
                                    <TableCell>
                                        {canEdit && (
                                            <Link href={route('warehouses.edit', wrhs.id)}>
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
                                                            {__(
                                                                'Are you sure you want to delete the warehouse :name?',
                                                                {
                                                                    name: wrhs.name,
                                                                }
                                                            )}
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">{__('Cancel')}</Button>
                                                        </DialogClose>
                                                        <Link
                                                            href={route('warehouses.destroy', wrhs.id)}
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
            </div>
        </AuthenticatedLayout>
    );
}

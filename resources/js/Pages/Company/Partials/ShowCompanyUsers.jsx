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

export default function ShowCompanyUsers({
    users = [],
    canCreate = false,
    canEdit = false,
    canDelete = false,
    className = '',
}) {
    const { __ } = useTraslations();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Company Users')}</h2>

                {canCreate && (
                    <div className="flex justify-end">
                        <Link href={route('users.create')}>
                            <Button>{__('Add :name', { name: __('user') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <Table className="mt-6">
                {!users.length && <TableCaption>{__('No Content')}</TableCaption>}
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-28">#</TableHead>
                        <TableHead>{__('RUT')}</TableHead>
                        <TableHead>{__('Name')}</TableHead>
                        {(canEdit || canDelete) && <TableHead className="w-56">{__('Options')}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.rut}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            {(canEdit || canDelete) && (
                                <TableCell>
                                    {canEdit && (
                                        <Link href={route('users.edit', user.id)}>
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
                                                        href={route('users.destroy', user.id)}
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

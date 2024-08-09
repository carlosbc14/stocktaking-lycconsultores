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

export default function Index({ auth, groups }) {
    const { __ } = useTraslations();

    const canCreate = auth.user.permissions.some((per) => per.name === 'write groups');
    const canEdit = auth.user.permissions.some((per) => per.name === 'edit groups');
    const canDelete = auth.user.permissions.some((per) => per.name === 'delete groups');

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
                <Table>
                    {!groups.length && <TableCaption>{__('No Content')}</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            <TableHead>{__('Parent Group')}</TableHead>
                            <TableHead>{__('Name')}</TableHead>
                            {(canEdit || canDelete) && <TableHead className="w-56">{__('Options')}</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups.map((grp) => (
                            <TableRow key={grp.id}>
                                <TableCell>{grp.parent_group ? grp.parent_group.name : '-'}</TableCell>
                                <TableCell>{grp.name}</TableCell>
                                {(canEdit || canDelete) && (
                                    <TableCell>
                                        {canEdit && (
                                            <Link href={route('groups.edit', grp.id)}>
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
                                                            {__('Are you sure you want to delete the group :name?', {
                                                                name: grp.name,
                                                            })}
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">{__('Cancel')}</Button>
                                                        </DialogClose>
                                                        <Link
                                                            href={route('groups.destroy', grp.id)}
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

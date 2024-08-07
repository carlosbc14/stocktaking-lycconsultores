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

export default function Index({ auth, products }) {
    const { __ } = useTraslations();

    const canCreate = auth.user.permissions.some((per) => per.name === 'write products');
    const canEdit = auth.user.permissions.some((per) => per.name === 'edit products');
    const canDelete = auth.user.permissions.some((per) => per.name === 'delete products');

    return (
        <AuthenticatedLayout user={auth.user} title={__('Products')}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                {canCreate && (
                    <div className="flex justify-end mb-6">
                        <Link href={route('products.create')}>
                            <Button>{__('Add :name', { name: __('products') })}</Button>
                        </Link>
                    </div>
                )}
                <Table>
                    {!products.length && <TableCaption>{__('No Content')}</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            <TableHead>{__('Code')}</TableHead>
                            <TableHead>{__('Description')}</TableHead>
                            <TableHead>{__('Group')}</TableHead>
                            <TableHead>{__('Unit')}</TableHead>
                            <TableHead>{__('Origin')}</TableHead>
                            <TableHead>{__('Currency')}</TableHead>
                            <TableHead>{__('Price')}</TableHead>
                            <TableHead>{__('Batch')}</TableHead>
                            <TableHead>{__('Enabled')}</TableHead>
                            {(canEdit || canDelete) && <TableHead className="w-56">{__('Options')}</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((prdct) => (
                            <TableRow key={prdct.id}>
                                <TableCell className="font-medium">{prdct.code}</TableCell>
                                <TableCell>{prdct.description}</TableCell>
                                <TableCell>{prdct.group ? prdct.group.name : '-'}</TableCell>
                                <TableCell>{prdct.unit || '-'}</TableCell>
                                <TableCell>{prdct.origin || '-'}</TableCell>
                                <TableCell>{prdct.currency || '-'}</TableCell>
                                <TableCell>{prdct.price || '-'}</TableCell>
                                <TableCell>{prdct.batch ? __('Sí') : __('No')}</TableCell>
                                <TableCell>{prdct.enabled ? __('Sí') : __('No')}</TableCell>
                                {(canEdit || canDelete) && (
                                    <TableCell>
                                        {canEdit && (
                                            <Link href={route('products.edit', prdct.id)}>
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
                                                            {__('Are you sure you want to delete the product :name?', {
                                                                name: prdct.description,
                                                            })}
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">{__('Cancel')}</Button>
                                                        </DialogClose>
                                                        <Link
                                                            href={route('products.destroy', prdct.id)}
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

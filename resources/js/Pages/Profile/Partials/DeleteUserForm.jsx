import { useRef } from 'react';
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    useToast,
} from '@/Components/ui';
import { InputError } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { useForm } from '@inertiajs/react';

export default function DeleteUserForm({ className = '' }) {
    const { __ } = useTraslations();
    const { toast } = useToast();
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: __('Account Successfully Deleted'),
                });
            },
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Delete Account')}</h2>

                <p className="mt-1 text-sm text-gray-600">
                    {__(
                        'Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.'
                    )}
                </p>
            </header>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">{__('Delete Account')}</Button>
                </DialogTrigger>
                <DialogContent>
                    <form onSubmit={deleteUser} className="p-6">
                        <DialogHeader>
                            <DialogTitle>{__('Are you sure you want to delete your account?')}</DialogTitle>
                            <DialogDescription>
                                {__(
                                    'Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.'
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="my-4">
                            <Label htmlFor="password" className="sr-only">
                                {__('Password')}
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block sm:w-3/4"
                                isFocused
                                placeholder={__('Password')}
                            />

                            <InputError message={__(errors.password)} className="mt-2" />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{__('Cancel')}</Button>
                            </DialogClose>
                            <Button variant="destructive" className="mb-2 sm:mb-0 sm:ms-3" disabled={processing}>
                                {__('Delete Account')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}

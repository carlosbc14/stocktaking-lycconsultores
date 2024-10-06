import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTraslations } from '@/Contexts/TranslationsContext';
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useToast,
} from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { InputError } from '@/Components';

export default function Edit({ auth, user, roles }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, patch, errors, processing } = useForm({
        rut: user.rut,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('company.users.update', user.id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Edit :name', { name: __('user') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('User Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Update user information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <Label htmlFor="rut">{__('RUT')}</Label>

                            <Input
                                id="rut"
                                className="mt-1 block w-full"
                                value={data.rut}
                                onChange={(e) => setData('rut', e.target.value)}
                                required
                                isFocused
                            />

                            <InputError className="mt-2" message={__(errors.rut)} />
                        </div>

                        <div>
                            <Label htmlFor="name">{__('Name')}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.name)} />
                        </div>

                        <div>
                            <Label htmlFor="email">{__('Email')}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={__(errors.email)} />
                        </div>

                        <div>
                            <Label htmlFor="role">{__('Role')}</Label>

                            <Select id="role" onValueChange={(v) => setData('role', v)} defaultValue={user.role}>
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue placeholder={__('Select a role')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {__(role.replace('_', ' ')).toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError message={__(errors.role)} className="mt-2" />
                        </div>

                        <Button disabled={processing}>{__('Save')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

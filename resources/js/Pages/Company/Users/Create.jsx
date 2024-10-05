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
import { InputError, PasswordInput } from '@/Components';

export default function Create({ auth, roles }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, post, errors, processing } = useForm({
        rut: '',
        name: '',
        email: '',
        password: '',
        role: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('users.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('user') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('User Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Complete the requested user information.')}</p>
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
                            <Label htmlFor="password">{__('Password')}</Label>

                            <PasswordInput
                                id="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />

                            <InputError message={__(errors.password)} className="mt-2" />
                        </div>

                        <div>
                            <Label htmlFor="role">{__('Role')}</Label>

                            <Select id="role" onValueChange={(v) => setData('role', v)}>
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

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

export default function Edit({ auth, group, groups }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, patch, errors, processing } = useForm({
        name: group.name,
        group_id: group.group_id,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('groups.update', group.id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Edit :name', { name: __('group') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section className="max-w-xl">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Group Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Update group information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <Label htmlFor="name">{__('Name')}</Label>

                            <Input
                                id="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                            />

                            <InputError className="mt-2" message={__(errors.code_sku)} />
                        </div>

                        <div>
                            <Label htmlFor="group">{__('Parent Group')}</Label>

                            <Select
                                id="group"
                                onValueChange={(v) => setData('group_id', v)}
                                defaultValue={data.group_id ? data.group_id.toString() : ''}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={__('Select a :name', { name: __('group') })} />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.map((grp) => (
                                        <SelectItem key={grp.id} value={grp.id.toString()}>
                                            {grp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={__(errors.group_id)} />
                        </div>

                        <Button disabled={processing}>{__('Save')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

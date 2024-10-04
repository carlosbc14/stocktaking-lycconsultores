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

export default function Create({ auth, groups }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, post, errors, processing } = useForm({
        groups: [{ name: '', group_id: '' }],
    });

    const handleChange = (index, name, value) => {
        const groups_to_add = [...data.groups];

        groups_to_add[index][name] = value;

        setData('groups', groups_to_add);
    };

    const addGroup = () => {
        setData('groups', [...data.groups, { name: '', group_id: '' }]);
    };

    const removeGroup = (index) => {
        const groups_to_add = [...data.groups];

        groups_to_add.splice(index, 1);

        setData('groups', groups_to_add);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('groups.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('groups') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Groups Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Complete the requested groups information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        {data.groups.map((grp, i) => (
                            <div key={i}>
                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-span-6 lg:col-span-4">
                                        <Label htmlFor={`name[${i}]`}>{__('Name')}</Label>

                                        <Input
                                            id={`name[${i}]`}
                                            value={grp.name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleChange(i, 'name', e.target.value)}
                                        />

                                        <InputError message={__(errors[`groups.${i}.name`])} className="mt-2" />
                                    </div>

                                    <div className="col-span-6 lg:col-span-2">
                                        <Label htmlFor={`group[${i}]`}>{__('Parent Group')}</Label>

                                        <Select
                                            id={`group[${i}]`}
                                            onValueChange={(v) => handleChange(i, 'group_id', v)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue
                                                    placeholder={__('Select a :name', { name: __('group') })}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map((sgrp) => (
                                                    <SelectItem key={sgrp.id} value={sgrp.id.toString()}>
                                                        {sgrp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <InputError message={__(errors[`groups.${i}.group_id`])} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removeGroup(i)}
                                        disabled={data.groups.length === 1}
                                    >
                                        {__('Delete')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex">
                            <Button type="submit" disabled={processing}>
                                {__('Save')}
                            </Button>

                            <Button type="button" className="ml-auto" onClick={addGroup}>
                                {__('Add')}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

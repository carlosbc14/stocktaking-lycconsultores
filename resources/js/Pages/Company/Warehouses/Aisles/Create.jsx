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

export default function Create({ auth, warehouse_id, groups }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    const { data, setData, post, errors, processing } = useForm({
        warehouse_id,
        aisles: [{ group_id: '', code: '', columns: '', rows: '' }],
    });

    const handleChange = (index, name, value) => {
        const aisles = [...data.aisles];

        aisles[index][name] = value;

        setData('aisles', aisles);
    };

    const addAisle = () => {
        setData('aisles', [...data.aisles, { group_id: '', code: '', columns: '', rows: '' }]);
    };

    const removeAisle = (index) => {
        const aisles = [...data.aisles];

        aisles.splice(index, 1);

        setData('aisles', aisles);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('warehouses.aisles.store'), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Create :name', { name: __('aisles') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Aisles Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Complete the requested aisles information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        {data.aisles.map((asl, i) => (
                            <div key={i}>
                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-span-6 lg:col-span-3">
                                        <Label htmlFor="group">{__('Group')}</Label>

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
                                                {groups.map((grp) => (
                                                    <SelectItem key={grp.id} value={grp.id.toString()}>
                                                        {grp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <InputError className="mt-2" message={__(errors[`aisles.${i}.group_id`])} />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label htmlFor="code">{__('Code')}</Label>

                                        <Input
                                            id={`code[${i}]`}
                                            className="mt-1 block w-full"
                                            value={asl.code}
                                            onChange={(e) => handleChange(i, 'code', e.target.value)}
                                        />

                                        <InputError className="mt-2" message={__(errors[`aisles.${i}.code`])} />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label htmlFor="columns">{__('Columns')}</Label>

                                        <Input
                                            id={`columns[${i}]`}
                                            className="mt-1 block w-full"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={asl.columns}
                                            onChange={(e) => handleChange(i, 'columns', e.target.value)}
                                        />

                                        <InputError className="mt-2" message={__(errors[`aisles.${i}.columns`])} />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <Label htmlFor="rows">{__('Rows')}</Label>

                                        <Input
                                            id={`row[${i}]`}
                                            className="mt-1 block w-full"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={asl.rows}
                                            onChange={(e) => handleChange(i, 'rows', e.target.value)}
                                        />

                                        <InputError className="mt-2" message={__(errors[`aisles.${i}.rows`])} />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removeAisle(i)}
                                        disabled={data.aisles.length === 1}
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

                            <Button type="button" className="ml-auto" onClick={addAisle}>
                                {__('Add')}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

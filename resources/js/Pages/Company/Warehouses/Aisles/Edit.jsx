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

export default function Edit({ auth, aisle, groups }) {
    const { __ } = useTraslations();
    const { toast } = useToast();

    let columns = 0,
        rows = 0;
    for (let location of aisle.locations) {
        if (location.column > columns) columns = location.column;
        if (location.row > rows) rows = location.row;
    }

    const { data, setData, patch, errors, processing } = useForm({
        group_id: aisle.group_id,
        code: aisle.code,
        columns,
        rows,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('aisles.update', aisle.id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({
                    title: __('Saved Successfully'),
                }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} title={__('Edit :name', { name: __('aisle') })}>
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <section>
                    <header>
                        <h2 className="text-lg font-medium text-gray-900">{__('Aisle Information')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{__('Update aisle information.')}</p>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-6 lg:col-span-3">
                                <Label htmlFor="group">{__('Group')}</Label>

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

                            <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="code">{__('Code')}</Label>

                                <Input
                                    id="code"
                                    className="mt-1 block w-full"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                />

                                <InputError className="mt-2" message={__(errors.code)} />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="columns">{__('Columns')}</Label>

                                <Input
                                    id="columns"
                                    className="mt-1 block w-full"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={data.columns}
                                    onChange={(e) => setData('columns', e.target.value)}
                                />

                                <InputError className="mt-2" message={__(errors.columns)} />
                            </div>

                            <div className="col-span-2 lg:col-span-1">
                                <Label htmlFor="rows">{__('Rows')}</Label>

                                <Input
                                    id="row"
                                    className="mt-1 block w-full"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={data.rows}
                                    onChange={(e) => setData('rows', e.target.value)}
                                />

                                <InputError className="mt-2" message={__(errors.rows)} />
                            </div>
                        </div>

                        <Button disabled={processing}>{__('Save')}</Button>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

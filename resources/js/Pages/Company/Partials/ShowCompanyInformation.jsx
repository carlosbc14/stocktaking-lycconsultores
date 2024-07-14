import { useTraslations } from '@/Contexts/TranslationsContext';
import { Button, Input, Label } from '@/Components/ui';
import { Link } from '@inertiajs/react';

export default function ShowCompanyInformation({ company, canEdit = false, className = '' }) {
    const { __ } = useTraslations();

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{__('Company Information')}</h2>

                {canEdit && (
                    <div className="flex justify-end">
                        <Link href={route('company.edit')}>
                            <Button>{__('Edit :name', { name: __('company') })}</Button>
                        </Link>
                    </div>
                )}
            </header>

            <div className="mt-6 space-y-6 max-w-xl">
                <div>
                    <Label htmlFor="rut">{__('RUT')}</Label>

                    <Input id="rut" className="mt-1 block w-full" value={company.rut} disabled />
                </div>

                <div>
                    <Label htmlFor="name">{__('Name')}</Label>

                    <Input id="name" className="mt-1 block w-full" value={company.name} disabled />
                </div>

                <div>
                    <Label htmlFor="business_sector">{__('Business Sector')}</Label>

                    <Input
                        id="business_sector"
                        className="mt-1 block w-full"
                        value={company.business_sector}
                        disabled
                    />
                </div>

                <div>
                    <Label htmlFor="address">{__('Address')}</Label>

                    <Input id="address" className="mt-1 block w-full" value={company.address} disabled />
                </div>
            </div>
        </section>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShowStocktakingLocationProducts from './Partials/ShowStocktakingLocationProducts';
import { useTraslations } from '@/Contexts/TranslationsContext';

export default function ShowLocation({ auth, stocktaking, location, products }) {
    const { __ } = useTraslations();

    return (
        <AuthenticatedLayout
            user={auth.user}
            title={`${__('Stocktaking')} #${stocktaking.id} (${location.aisle.code}-${location.column}-${
                location.row
            })`}
        >
            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <ShowStocktakingLocationProducts
                    canReset={auth.user.permissions.some((per) => per.name === 'write stocktakings')}
                    stocktakingId={stocktaking.id}
                    locationId={location.id}
                    products={products}
                />
            </div>
        </AuthenticatedLayout>
    );
}

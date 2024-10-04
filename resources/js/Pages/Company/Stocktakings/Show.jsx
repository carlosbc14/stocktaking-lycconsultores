import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShowStocktakingProducts from './Partials/Showstocktakingproducts';
import ShowStocktakingInformation from './Partials/ShowstocktakingInformation';
import { useTraslations } from '@/Contexts/TranslationsContext';

export default function Show({ auth, stocktaking }) {
    const { __ } = useTraslations();

    return (
        <AuthenticatedLayout
            user={auth.user}
            title={`${__('Stocktaking')} #${stocktaking.id} (${
                stocktaking.finished_at ? __('Finished') : __('In Process')
            })`}
        >
            <div className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowStocktakingInformation
                        canEdit={
                            auth.user.permissions.some((per) => per.name === 'edit stocktakings') &&
                            !stocktaking.finished_at
                        }
                        stocktaking={stocktaking}
                    />
                </div>

                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ShowStocktakingProducts
                        stocktakingFinished={stocktaking.finished_at}
                        canCreate={
                            auth.user.permissions.some((per) => per.name === 'write stocktakings') &&
                            !stocktaking.finished_at
                        }
                        stocktakingId={stocktaking.id}
                        products={stocktaking.products}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

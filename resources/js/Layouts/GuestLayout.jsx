import { LangSelect } from '@/Components';
import { Head } from '@inertiajs/react';

export default function Guest({ title, children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Head title={title} />

            <header className="flex w-full">
                <LangSelect className="my-2 mr-4 ml-auto" />
            </header>

            <main className="flex flex-1 flex-col sm:justify-center items-center pt-6 sm:pt-0">
                <div className="text-gray-400 text-4xl">
                    <strong>
                        Inventario <span className="text-primary">App</span>
                    </strong>
                </div>

                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    {children}
                </div>
            </main>
        </div>
    );
}

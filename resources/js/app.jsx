import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { TraslationsProvider } from './Contexts/TranslationsContext';
import { Toaster } from './Components/ui';

const appName = import.meta.env.VITE_APP_NAME || 'Inventario';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <TraslationsProvider locale={props.initialPage.props.locale} language={props.initialPage.props.language}>
                <App {...props} />
                <Toaster />
            </TraslationsProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

import { createContext, useContext } from 'react';

export const TraslationsContext = createContext();

export const useTraslations = () => {
    const context = useContext(TraslationsContext);

    if (!context) {
        throw new Error('useTraslations debe ser usado dentro de TraslationsProvider');
    }

    return context;
};

export const TraslationsProvider = ({ locale, language, children }) => {
    const __ = (key, replace = {}) => {
        let translation = language[key] ? language[key] : key;

        Object.keys(replace).forEach((key) => {
            translation = translation.replace(':' + key, replace[key]);
        });

        return translation;
    };

    return <TraslationsContext.Provider value={{ locale, __ }}>{children}</TraslationsContext.Provider>;
};

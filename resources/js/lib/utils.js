import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getDateFormatPattern(locale) {
    const getPatternForPart = (part) => {
        switch (part.type) {
            case 'day':
                return 'D'.repeat(part.value.length);
            case 'month':
                return 'M'.repeat(part.value.length);
            case 'year':
                return 'Y'.repeat(part.value.length);
            case 'literal':
                return part.value;
            default:
                console.log('Unsupported date part', part);
                return '';
        }
    };

    return new Intl.DateTimeFormat(locale).formatToParts(new Date()).map(getPatternForPart).join('');
}

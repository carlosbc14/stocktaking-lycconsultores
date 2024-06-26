import { cn } from '@/lib/utils';

export function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={cn('text-sm text-red-600', className)}>
            {message}
        </p>
    ) : null;
}

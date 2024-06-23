import { Link } from '@inertiajs/react';
import { Home } from 'lucide-react';
import { buttonVariants } from './ui';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { cn } from '@/lib/utils';

const links = [
    {
        route: 'dashboard',
        name: 'Dashboard',
        icon: Home,
    },
];

export function SideBar({ className = '' }) {
    const { __ } = useTraslations();

    return (
        <nav className={cn('bg-white border-r border-gray-100', className)}>
            <div className="flex items-center h-16 px-4">
                <Link href={route('dashboard')}>
                    <div className="text-gray-400 text-2xl">
                        <strong>
                            Stock<span className="text-primary">taking</span>
                        </strong>
                    </div>
                </Link>
            </div>
            <div className="py-6 px-4 overflow-y-auto">
                <ul className="space-y-2">
                    {links.map((props, index) => (
                        <li key={index}>
                            <Link
                                href={route(props.route)}
                                className={cn(
                                    buttonVariants({ variant: route().current(props.route) ? 'default' : 'secondary' }),
                                    'w-full justify-start'
                                )}
                            >
                                <props.icon className="mr-2 h-4 w-4" />
                                {__(props.name)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

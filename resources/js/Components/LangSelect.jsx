import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { cn } from '@/lib/utils';

export function LangSelect({ className = '' }) {
    const { locale } = useTraslations();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn('font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 px-3', className)}
                >
                    {locale}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                {['es', 'en'].map((lang) => (
                    <a key={lang} href={route('locale', lang)}>
                        <DropdownMenuItem className="uppercase">{lang}</DropdownMenuItem>
                    </a>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

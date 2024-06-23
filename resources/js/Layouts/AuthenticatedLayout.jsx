import { ChevronDown, ListMinus, LogOut, User } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/Components/ui';
import { LangSelect, SideBar } from '@/Components';
import { useTraslations } from '@/Contexts/TranslationsContext';
import { Head, Link } from '@inertiajs/react';

export default function Authenticated({ user, title, children }) {
    const { __ } = useTraslations();

    return (
        <div className="min-h-screen h-screen flex bg-gray-100">
            <Head title={title} />

            <SideBar className="hidden sm:block w-80" />

            <div className="flex flex-col w-full">
                <header className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" className="sm:hidden px-2">
                                        <ListMinus />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="p-0" side="left">
                                    <SheetTitle className="hidden"></SheetTitle>
                                    <SheetDescription className="hidden"></SheetDescription>
                                    <SideBar className="w-full" />
                                </SheetContent>
                            </Sheet>

                            <div className="flex ms-auto">
                                <LangSelect />
                                <div className="ms-3 relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                                            >
                                                {user.name}
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            <Link href={route('profile.edit')}>
                                                <DropdownMenuItem>
                                                    <User className="mr-2 h-4 w-4" />
                                                    <span>{__('Profile')}</span>
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator />
                                            <Link href={route('logout')} method="post" as="button" className="w-full">
                                                <DropdownMenuItem>
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    <span>{__('Log Out')}</span>
                                                </DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {title && (
                    <header className="bg-white border-b border-gray-100">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>
                        </div>
                    </header>
                )}

                <main className="flex-1 min-w-0 overflow-y-auto py-12 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>

                <footer className="h-14 p-4 bg-white border-t border-gray-100 md:px-6">
                    <span className="block text-sm text-gray-500 text-center">
                        {`© ${new Date().getFullYear()} `}
                        <Link href={route('dashboard')} className="hover:underline">
                            Stocktaking
                        </Link>
                    </span>
                </footer>
            </div>
        </div>
    );
}

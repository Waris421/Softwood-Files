'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "../auth/LogoutBtn"
import HomeButton from "../generic/HomeBtn";
import { ThemeToggle } from "../generic/ThemeToggle";
import BackForthButton from "../generic/BackForthBtn";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport } from "../ui/navigation-menu";
import { Loader } from "lucide-react";
import { cn } from "../generic/utils";
import { THEME } from "../constants/ui";

interface NavItem {
  label: string;
  href?: string;
  children?: { 
    label: string;
    href: string;
    subtext?: string;
  }[];
}

const NavBar = ({ pageName }: { pageName: string }) => {
    const [items, setItems] = useState<NavItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNavbarItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/navbar?pageName=${pageName}`);
            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details?.message || "Failed to fetch navbar");
            }
            const navItems: NavItem[] = await response.json();
            setItems(navItems); // Update state with fetched items
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNavbarItems();
    }, [pageName]);

    return (
        <div className="sticky top-0 z-50 w-full border-b bg-base-100/90 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 items-center justify-between w-full">
                <div className="flex items-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {isLoading ? (
                                <div className="flex items-center gap-2 px-4 opacity-50">
                                    <Loader className="w-4 h-4 animate-spin animation-duration-[2.5s]" />
                                    <span className="text-sm font-medium">Loading...</span>
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <NavigationMenuItem key={index}>
                                        {item.children ? (
                                            <>
                                                <NavigationMenuTrigger className="text-md font-medium">
                                                    {item.label}
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent>
                                                    <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
                                                        {item.children.map((child) => (
                                                            <li key={child.href}>
                                                                <NavigationMenuLink asChild>
                                                                    <Link
                                                                        href={child.href}
                                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-base-300 hover:text-accent-foreground"
                                                                    >
                                                                        <div className="text-sm font-medium leading-none">
                                                                            {child.label}
                                                                        </div>
                                                                        {child.subtext && (
                                                                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                                                {child.subtext}
                                                                            </p>
                                                                        )}
                                                                    </Link>
                                                                </NavigationMenuLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </NavigationMenuContent>
                                            </>
                                        ) : (
                                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                                <Link href={item.href || "#"}>
                                                    {item.label}
                                                </Link>
                                            </NavigationMenuLink>
                                        )}
                                    </NavigationMenuItem>
                                ))
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                        <ThemeToggle />
                        <HomeButton />
                        <BackForthButton />
                        <LogoutButton />
                    </div>
                </div>
            </div>
            {error && (
                <div className={cn("py-1 text-center text-xs", THEME.Text.RedText)}>
                    {error}
                </div>
            )}
        </div>
    )
}

export default NavBar
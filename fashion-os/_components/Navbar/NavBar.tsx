'use client'

import { useEffect, useState } from "react";
import LogoutButton from "../auth/LogoutBtn"
import HomeButton from "../generic/HomeBtn";
import { ThemeToggle } from "../generic/ThemeToggle";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
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
        <div className="sticky top-0 z-100 w-full border-b border-base-300 bg-base-100/95 backdrop-blur-sm shadow-sm">
            <div className="navbar w-full px-0">
                <div className="navbar-start flex-1 min-w-0">
                    <div className="hidden lg:flex">
                        <ul className="menu menu-horizontal gap-1 px-1 font-medium text-base-content flex-nowrap">
                            {isLoading && (
                                <div className="flex items-center gap-4 px-4 h-8">
                                    <span className="loading loading-dots loading-sm opacity-50"></span>
                                    <span className="text-xs uppercase tracking-widest opacity-30">Loading Menu</span>
                                </div>
                            )}

                            {!isLoading && items.map((item, index) => (
                                <li key={index} className={item.children ? "dropdown dropdown-hover" : ""}>
                                {item.children ? (
                                    <>
                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm rounded-btn text-base-content hover:text-primary text-lg h-8 min-h-8">
                                        {item.label}
                                        <ChevronDown className="opacity-50" />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu p-2 bg-secondary rounded-lg w-52 mt-0">
                                        {item.children.map((child, childIndex) => (
                                        <li key={childIndex}>
                                            <Link href={child.href} className="hover:bg-primary hover:text-secondary">
                                            {child.label}
                                            </Link>
                                        </li>
                                        ))}
                                    </ul>
                                    </>
                                ) : (
                                    <Link href={item.href || "#"} className="btn btn-ghost btn-sm rounded-btn text-base-content hover:text-primary text-lg h-8 min-h-8">
                                    {item.label}
                                    </Link>
                                )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="navbar-end flex-none gap-3">
                    <div className="flex items-center gap-2 p-1.5 bg-base-200 rounded-lg border border-base-300">
                        <div className="hover:bg-base-300 rounded-md transition-colors p-0.5">
                            <ThemeToggle />
                        </div>
                        <div className="hover:bg-base-300 rounded-md transition-colors p-0.5">
                            <HomeButton />
                        </div>
                        <div className="hover:bg-base-300 rounded-md transition-colors p-0.5">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </div>
            {error && (
                <div className="alert alert-error rounded-none py-1 text-xs justify-center">
                <span>{error}</span>
                </div>
            )}
        </div>
    )
}

export default NavBar
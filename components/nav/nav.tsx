"use client";
import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    RiSettings4Line,
    RiQuestionLine,
    RiLogoutBoxLine,
    RiTeamFill,
    RiShoppingBag2Fill,
    RiDashboard2Fill,
    RiCalendarCheckFill,
    RiBookmarkLine,
    RiScissorsCutLine
} from "react-icons/ri";
import { GiAbstract103 } from "react-icons/gi";
import { CgSpinner } from "react-icons/cg";
import { FaMobileAlt } from "react-icons/fa";

import { NavItem } from "./NavItem";

const Nav = () => {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();

    const handleSignOut = () => {
        setIsLoading(true);
        signOut();
    };

    const isActive = (path: string) => path === "/dashboard" ? pathname === path : pathname.startsWith(path);

    return (
        <nav className="sticky top-5 flex flex-col h-[calc(100vh-40px)] max-w-[25%] min-w-64 bg-[#F3F3F3] rounded-3xl p-6 shadow-sm overflow-y-auto custom-scrollbar">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <GiAbstract103 className="text-lg" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">Cutless</span>
            </div>

            {/* Menu Section */}
            <div className="mb-8">
                <p className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</p>
                <div className="space-y-1">
                    {(session?.user?.role === "owner" || session?.user?.role === "admin" || session?.user?.role === "co-owner") && (
                        <NavItem
                            href="/dashboard"
                            label="Dashboard"
                            icon={RiDashboard2Fill}
                            isActive={isActive("/dashboard")}
                        />
                    )}

                    {(session?.user?.role === "owner" || session?.user?.role === "capster" || session?.user?.role === "co-owner") && (
                        <NavItem
                            href="/dashboard/barbershops"
                            label="Barbershop"
                            icon={RiShoppingBag2Fill}
                            isActive={isActive("/dashboard/barbershops")}
                        />
                    )}

                    {(session?.user?.role === "owner" || session?.user?.role === "capster" || session?.user?.role === "admin" || session?.user?.role === "co-owner") && (
                        <NavItem
                            href="/dashboard/capsters"
                            label="Teams"
                            icon={RiTeamFill}
                            isActive={isActive("/dashboard/capsters")}
                        />
                    )}

                    {(session?.user?.role === "owner" || session?.user?.role === "capster" || session?.user?.role === "admin" || session?.user?.role === "co-owner") && (
                        <NavItem
                            href="/dashboard/appointments"
                            label="Calendar"
                            icon={RiCalendarCheckFill}
                            isActive={isActive("/dashboard/appointments")}
                        />
                    )}

                    {(session?.user?.role === "owner" || session?.user?.role === "co-owner") && (
                        <NavItem
                            href="/dashboard/services"
                            label="Services"
                            icon={RiScissorsCutLine}
                            isActive={isActive("/dashboard/services")}
                        />
                    )}

                    {(session?.user?.role === "owner" || session?.user?.role === "co-owner") && (
                        <NavItem
                            href="/dashboard/book"
                            label="Book"
                            icon={RiBookmarkLine}
                            isActive={isActive("/dashboard/book")}
                        />
                    )}
                </div>
            </div>

            {/* General Section */}
            <div className="mb-auto">
                <p className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">General</p>
                <NavItem
                    href="/dashboard/settings"
                    label="Settings"
                    icon={RiSettings4Line}
                    isActive={isActive("/dashboard/settings")}
                />
                <NavItem
                    href="/dashboard/help"
                    label="Help"
                    icon={RiQuestionLine}
                    isActive={isActive("/dashboard/help")}
                />
                <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    {isLoading ? <CgSpinner className="animate-spin text-xl" /> : <RiLogoutBoxLine className="text-xl" />}
                    <span>Logout</span>
                </button>
            </div>

            {/* Promo Card */}
            <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900 to-green-800 p-5 text-center shadow-lg">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-green-500/20 rounded-full blur-xl"></div>

                <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <FaMobileAlt className="text-white text-lg" />
                </div>
                <h3 className="text-white font-bold text-lg leading-tight mb-1">Download our Mobile App</h3>
                <p className="text-green-100 text-xs mb-4">Get easy in another way</p>
                <button className="w-full py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    Download
                </button>
            </div>
        </nav>
    );
};

export default Nav;

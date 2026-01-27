"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
    const { data: session } = useSession();
    return (
        <div className="w-full flex justify-end items-start mb-10 bg-[#F3F3F3] p-5 rounded-3xl">
            <div className="flex items-center">
                <Link href="dashboard/profile" className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="Profile" className="w-full h-full rounded-full" />
                        ) : (
                            <span className="text-xl font-bold">{session?.user?.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">{session?.user?.name}</span>
                        <span className="text-xs text-gray-500">{session?.user?.role}</span>
                    </div>
                </Link>
            </div>
        </div>
    )
}

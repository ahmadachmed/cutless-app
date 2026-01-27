import Link from "next/link";
import { IconType } from "react-icons";

interface NavItemProps {
    href: string;
    label: string;
    icon: IconType;
    isActive?: boolean;
}

export const NavItem = ({ href, label, icon: Icon, isActive }: NavItemProps) => {
    return (
        <Link href={href}>
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isActive
                ? " text-gray-900 font-bold border-l-4 border-green-600"
                : "text-gray-500 hover:text-gray-900"
                }`}>
                <div className="flex items-center gap-3">
                    <Icon className={`text-xl ${isActive ? "text-green-600" : ""}`} />
                    <span>{label}</span>
                </div>
            </div>
        </Link>
    );
};

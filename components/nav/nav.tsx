"use client";
import { ImProfile } from "react-icons/im";
import { FaCalendarCheck } from "react-icons/fa";
import { Button } from "../ui/Button/button";
import { Gi3dHammer, GiAbstract013, GiAbstract103, GiVibratingBall } from "react-icons/gi";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { useRouter } from "next/navigation";

const Nav = () => {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignOut = () => {
        setIsLoading(true);
        signOut();
    }

    return (
        <nav className="flex flex-col min-h-[calc(100vh-56px)] justify-between items-center bg-[#101010] rounded-3xl p-4">
            <div className="flex flex-col items-center text-xl gap-10">
                <div className="bg-white/30 rounded-full p-4">
                    <h1 className="text-white text-2xl bg-black rounded-sm"><GiAbstract103 /></h1>
                </div>
                <div className="gap-5 flex flex-col text-xl">
                    {session?.user?.role === "owner" && (
                        <Button variant="transparent" onClick={() => { router.push("/dashboard/barbershops") }} title="Dashboard"><GiAbstract013 /></Button>
                    )}
                    {session?.user?.role === "owner" && (
                        <Button variant="transparent" onClick={() => { router.push("/dashboard/services") }} title="Manage Services"><Gi3dHammer /></Button>
                    )}
                    {session?.user?.role === "owner" && (
                        <Button variant="transparent" onClick={() => { router.push("/dashboard/book") }} title="Book Appointment"><GiVibratingBall /></Button>
                    )}
                    {(session?.user?.role === "owner" || session?.user?.role === "capster") && (
                        <Button variant="transparent" onClick={() => { router.push("/dashboard/appointments") }} title="Appointments"><FaCalendarCheck /></Button>
                    )}
                    <Button variant="transparent" onClick={() => { }}><GiAbstract013 /></Button>
                </div>
            </div>
            <div className="flex flex-col text-xl">
                <Button variant="transparent" className="text-sm font-extrabold p-2 bg-white/30" onClick={handleSignOut} disabled={isLoading}>
                    {isLoading ? <CgSpinner className="animate-spin text-xl" /> : session?.user?.name ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : <ImProfile />}
                </Button>
            </div>
        </nav>
    )
}

export default Nav

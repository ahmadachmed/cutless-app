import { getOwnerWithBarbershops } from "@/app/lib/dal";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";



export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin");
    }

    const userId = session.user?.id;
    if (!userId) {
        // If the session doesn't contain a user id, redirect to sign-in
        redirect("/api/auth/signin");
    }

    const profile = await getOwnerWithBarbershops(userId);
    console.log("DashboardPage profile:", profile);

    if (!profile) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <p>Profile not found.</p>
            </div>
        );
    }

    return (
        <DashboardClient barbershops={profile.barbershops} />
    );
}
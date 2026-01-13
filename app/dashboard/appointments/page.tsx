import { getAppointmentsForUser } from "@/app/lib/dal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AppointmentsClient from "./AppointmentsClient";

export default async function AppointmentsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const appointments = await getAppointmentsForUser(session.user.id!);

    return (
        <AppointmentsClient appointments={appointments} />
    );
}

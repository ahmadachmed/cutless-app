import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getTeamsForOwner, getBarbershopsForOwner } from "@/app/lib/dal";
import TeamClient from "./TeamClient";

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const user = session.user;

  if (!user || !user.id || (user.role !== "owner" && user.role !== "admin" && user.role !== "co-owner")) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Only owners, admins, and co-owners can manage team members.</p>
      </div>
    );
  }

  const teams = await getTeamsForOwner(user.id);
  const barbershops = await getBarbershopsForOwner(user.id);

  return (
    <TeamClient initialTeams={teams} initialBarbershops={barbershops} />
  );
}

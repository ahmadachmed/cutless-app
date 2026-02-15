import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getCapstersForOwner, getBarbershopsForOwner } from "@/app/lib/dal";
import CapsterClient from "./CapsterClient";

export default async function CapstersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const user = session.user;

  if (!user || !user.id || (user.role !== "owner" && user.role !== "admin" && user.role !== "co-owner")) {
    // Ideally use a more robust access denied page or redirect
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Only owners, admins, and co-owners can manage team members.</p>
      </div>
    );
  }

  // Fetch initial data
  const capsters = await getCapstersForOwner(user.id); // Validated that this now delegates to getCapstersForUser
  const barbershops = await getBarbershopsForOwner(user.id);

  return (
    <CapsterClient initialCapsters={capsters} initialBarbershops={barbershops} />
  );
}
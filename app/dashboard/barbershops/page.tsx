import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getBarbershopsForOwner } from "@/app/lib/dal";
import BarbershopClient from "./BarbershopClient";

export default async function BarbershopsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const user = session.user;

  if (!user || !user.id || (user.role !== "owner" && user.role !== "co-owner")) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Only owners and co-owners can manage barbershops.</p>
      </div>
    );
  }

  const barbershops = await getBarbershopsForOwner(user.id);

  return (
    <BarbershopClient initialBarbershops={barbershops} />
  );
}


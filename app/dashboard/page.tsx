import { getUserProfile } from "@/app/lib/dal";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";



export default async function DashboardPage() {
      const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin"); // Redirect instead of throwing
  }
    const profile = await getUserProfile();
    console.log("User Profile:", profile);
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your {profile.name}!</p>
        </div>
    );
}
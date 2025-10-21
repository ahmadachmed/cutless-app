import { getUserProfile } from "@/app/lib/dal";

export default async function DashboardPage() {
    const profile = await getUserProfile();
    console.log("User Profile:", profile);
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your {profile.name}!</p>
        </div>
    );
}
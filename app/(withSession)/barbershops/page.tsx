"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Barbershop = {
  id: string;
  name: string;
  subscriptionPlan: string;
};

export default function BarbershopsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [name, setName] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "owner") {
      fetchBarbershops();
    }
  }, [status, session]);

  async function fetchBarbershops() {
    try {
      const res = await fetch("/api/barbershops", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json();
        setBarbershops(data);
      } else {
        alert("Failed to fetch barbershops");
      }
    } catch {
      alert("Error fetching barbershops");
    }
  }

  async function handleAdd() {
    if (!name) return alert("Please enter a barbershop name");
    setLoading(true);
    try {
      const res = await fetch("/api/barbershops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subscriptionPlan }),
      });
      if (res.ok) {
        const newShop = await res.json();
        setBarbershops((prev) => [...prev, newShop]);
        setName("");
      } else {
        alert("Failed to add barbershop");
      }
    } catch {
      alert("Error adding barbershop");
    }
    setLoading(false);
  }

  if (status === "loading") return <p>Loading...</p>;

  if (status === "authenticated" && session?.user?.role !== "owner") {
    return <p>Unauthorized. Only owners can access this page.</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded">
      <h1 className="text-2xl font-semibold mb-4">Barbershop Management</h1>

      <div className="mb-4">
        <input
          placeholder="New barbershop name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded mr-2 w-2/3"
        />
        <select
          value={subscriptionPlan}
          onChange={(e) => setSubscriptionPlan(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <button
          disabled={loading}
          onClick={handleAdd}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Barbershop"}
        </button>
      </div>

      <ul>
        {barbershops.map((shop) => (
          <li key={shop.id} className="mb-2 p-2 border rounded">
            <strong>{shop.name}</strong> - {shop.subscriptionPlan}
          </li>
        ))}
      </ul>
    </div>
  );
}

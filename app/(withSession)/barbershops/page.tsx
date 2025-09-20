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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubscriptionPlan, setEditSubscriptionPlan] = useState("free");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "owner") {
      alert("Access denied. Only owners can manage barbershops.");
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "owner") {
      fetchBarbershops();
    }
  }, [status, session]);

  async function fetchBarbershops() {
    try {
      const res = await fetch("/api/barbershops", {
        credentials: "include",
      });
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
        credentials: "include",
      });
      if (res.ok) {
        const newShop = await res.json();
        setBarbershops((prev) => [...prev, newShop]);
        setName("");
      } else {
        const errorData = await res.json();
        alert("Failed to add barbershop: " + (errorData.error || "Unknown error"));
      }
    } catch {
      alert("Error adding barbershop");
    }
    setLoading(false);
  }

  // Start editing barbershop
  function startEdit(shop: Barbershop) {
    setEditingId(shop.id);
    setEditName(shop.name);
    setEditSubscriptionPlan(shop.subscriptionPlan);
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditSubscriptionPlan("free");
  }

  // Save edited barbershop
  async function saveEdit() {
    if (!editName) return alert("Please enter a barbershop name");
    if (!editingId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/barbershops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editName,
          subscriptionPlan: editSubscriptionPlan,
        }),
        credentials: "include",
      });
      if (res.ok) {
        const updatedShop = await res.json();
        setBarbershops((prev) =>
          prev.map((shop) => (shop.id === updatedShop.id ? updatedShop : shop))
        );
        cancelEdit();
      } else {
        const errorData = await res.json();
        alert("Failed to update barbershop: " + (errorData.error || "Unknown error"));
      }
    } catch {
      alert("Error updating barbershop");
    }
    setLoading(false);
  }

  // Delete barbershop
  async function deleteBarbershop(id: string) {
    if (!confirm("Are you sure you want to delete this barbershop?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/barbershops?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setBarbershops((prev) => prev.filter((shop) => shop.id !== id));
      } else {
        const errorData = await res.json();
        alert("Failed to delete barbershop: " + (errorData.error || "Unknown error"));
      }
    } catch {
      alert("Error deleting barbershop");
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
        {editingId ? (
          <>
            <input
              placeholder="Barbershop name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border p-2 rounded mr-2 w-2/3"
            />
            <select
              value={editSubscriptionPlan}
              onChange={(e) => setEditSubscriptionPlan(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <button
              disabled={loading}
              onClick={saveEdit}
              className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              disabled={loading}
              onClick={cancelEdit}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <ul>
        {barbershops.map((shop) => (
          <li key={shop.id} className="mb-2 p-2 border rounded flex justify-between items-center">
            <span>
              <strong>{shop.name}</strong> - {shop.subscriptionPlan}
            </span>
            <span>
              <button
                onClick={() => startEdit(shop)}
                className="mr-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteBarbershop(shop.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { stat } from "fs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Capster = {
  id: string;
  specialization: string | null;
  user: { id: string; name: string | null; email: string };
  barbershop: { id: string; name: string };
};

type Barbershop = {
  id: string;
  name: string;
}

export default function CapstersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [capsters, setCapsters] = useState<Capster[]>([]);
  const [userId, setUserId] = useState("");
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [barbershopId, setBarbershopId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "owner") {
      alert("Access denied. Only owners can manage capsters.");
      router.push("/");
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "owner")
      fetch("/api/capsters")
        .then((res) => res.json())
        .then(setCapsters)
        .catch(console.error);
  }, [status, session]);

  useEffect(() => {
    async function fetchBarbershops() {
      if (status === "authenticated" && session?.user?.role === "owner")
        fetch("/api/barbershops")
          .then((res) => res.json())
          .then(setBarbershops)
          .catch(console.error);
    }
    fetchBarbershops();
  }, [status, session]);

  async function handleAdd() {
    if (!userId || !barbershopId) {
      alert("User ID and Barbershop ID are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/capsters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, barbershopId, specialization }),
        credentials: "include",
      });
      if (res.ok) {
        // After successful add, reload the full list so related objects are included
        await fetch("/api/capsters", { credentials: "include" })
          .then((res) => res.json())
          .then(setCapsters);
        setUserId("");
        setBarbershopId("");
        setSpecialization("");
      }
      else {
        alert("Failed to add capster");
      }
    } catch {
      alert("Error adding capster");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this capster?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/capsters?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCapsters((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete capster");
      }
    } catch {
      alert("Error deleting capster");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-lg shadow-md bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Capster Management</h1>

      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
            Capster User ID (user who already registered as a capster)
          </label>
          <input
            id="userId"
            placeholder="Capster User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="barbershopId" className="block text-sm font-medium text-gray-700 mb-1">
            Barbershop
          </label>
          <select
            id="barbershopId"
            value={barbershopId}
            onChange={(e) => setBarbershopId(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Barbershop</option>
            {barbershops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
            Specialization (optional)
          </label>
          <input
            id="specialization"
            placeholder="Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          disabled={loading}
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Capster"}
        </button>
      </div>

      <ul className="space-y-3">
        {capsters.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow bg-gray-50"
          >
            <div className="text-gray-800">
              <strong className="font-semibold">{c.user?.name || c.user?.email}</strong> -{" "}
              <span className="italic text-gray-600">{c.barbershop?.name}</span>{" "}
              {c.specialization && <span className="text-blue-600">({c.specialization})</span>}
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

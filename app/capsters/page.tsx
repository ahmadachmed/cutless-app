"use client";

import { useState, useEffect } from "react";

type Capster = {
  id: string;
  specialization: string | null;
  user: { id: string; name: string | null; email: string };
  barbershop: { id: string; name: string };
};

export default function CapstersPage() {
  const [capsters, setCapsters] = useState<Capster[]>([]);
  const [userId, setUserId] = useState("");
  const [barbershopId, setBarbershopId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/capsters")
      .then((res) => res.json())
      .then(setCapsters)
      .catch(console.error);
  }, []);

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
      });
      if (res.ok) {
        const newCapster = await res.json();
        setCapsters((prev) => [...prev, newCapster]);
        setUserId("");
        setBarbershopId("");
        setSpecialization("");
      } else {
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
      const res = await fetch(`/api/capsters?id=${id}`, { method: "DELETE" });
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
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded">
      <h1 className="text-2xl font-semibold mb-4">Capster Management</h1>

      <div className="mb-4 space-y-2">
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Barbershop ID"
          value={barbershopId}
          onChange={(e) => setBarbershopId(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Specialization (optional)"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          disabled={loading}
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Capster"}
        </button>
      </div>

      <ul>
        {capsters.map((c) => (
          <li key={c.id} className="mb-2 p-2 border rounded flex justify-between items-center">
            <div>
              <strong>{c.user.name || c.user.email}</strong> - {c.barbershop.name}{" "}
              {c.specialization && `(${c.specialization})`}
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

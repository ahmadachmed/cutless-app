"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
    barbershopId: string;
};

type Barbershop = {
    id: string;
    name: string;
    services: Service[];
};

export default function ServicesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
    const [selectedBarbershopId, setSelectedBarbershopId] = useState("");

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/signin");
        if (status === "authenticated" && session?.user?.role !== "owner") {
            alert("Unauthorized");
            router.push("/dashboard");
        }
        if (status === "authenticated" && session?.user?.role === "owner") {
            fetchBarbershops();
        }
    }, [status, session, router]);

    async function fetchBarbershops() {
        const res = await fetch("/api/barbershops");
        if (res.ok) {
            const data = await res.json();
            setBarbershops(data);
            if (data.length > 0) setSelectedBarbershopId(data[0].id);
        }
    }

    async function addService() {
        if (!name || !price || !duration || !selectedBarbershopId) return alert("Fill all fields");
        setLoading(true);
        try {
            const res = await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    price: parseFloat(price),
                    duration: parseInt(duration),
                    barbershopId: selectedBarbershopId
                }),
            });
            if (res.ok) {
                // Refresh data
                fetchBarbershops();
                setName("");
                setPrice("");
                setDuration("");
            } else {
                alert("Failed to add service");
            }
        } catch {
            alert("Error adding service");
        }
        setLoading(false);
    }

    if (status === "loading") return <p>Loading...</p>;

    const selectedShop = barbershops.find(b => b.id === selectedBarbershopId);

    return (
        <div className="max-w-4xl mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-6">Manage Services</h1>

            {barbershops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar / Shop Selector */}
                    <div className="bg-white p-4 rounded shadow border">
                        <h3 className="font-semibold mb-2">Select Barbershop</h3>
                        <ul>
                            {barbershops.map(shop => (
                                <li key={shop.id}>
                                    <button
                                        onClick={() => setSelectedBarbershopId(shop.id)}
                                        className={`w-full text-left px-3 py-2 rounded ${selectedBarbershopId === shop.id ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                                    >
                                        {shop.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Add Service Form */}
                        <div className="bg-white p-4 rounded shadow border">
                            <h3 className="font-semibold mb-4">Add New Service for {selectedShop?.name}</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    placeholder="Service Name (e.g. Haircut)"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="border p-2 rounded w-full"
                                />
                                <input
                                    placeholder="Price"
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="border p-2 rounded w-full"
                                />
                                <input
                                    placeholder="Duration (minutes)"
                                    type="number"
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                            <button
                                onClick={addService}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {loading ? "Adding..." : "Add Service"}
                            </button>
                        </div>

                        {/* Service List */}
                        <div className="bg-white p-4 rounded shadow border">
                            <h3 className="font-semibold mb-4">Existing Services</h3>
                            {selectedShop?.services && selectedShop.services.length > 0 ? (
                                <ul className="divide-y">
                                    {selectedShop.services.map(service => (
                                        <li key={service.id} className="py-2 flex justify-between">
                                            <span>
                                                <strong>{service.name}</strong> ({service.duration} mins)
                                            </span>
                                            <span className="font-mono">${service.price}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No services added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p>You need to create a barbershop first.</p>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
};

type Capster = {
    id: string;
    specialization: string | null;
    user: { name: string | null };
};

type Barbershop = {
    id: string;
    name: string;
    address: string;
    services: Service[];
    capsters: Capster[];
};

export default function BookPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
    const [selectedShop, setSelectedShop] = useState<Barbershop | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedCapster, setSelectedCapster] = useState<Capster | null>(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/signin");
        if (status === "authenticated" && session?.user?.role !== "customer") {
            // alert("Only customers can book appointments");
            // router.push("/dashboard");
        }
        fetchBarbershops();
    }, [status, session, router]);

    async function fetchBarbershops() {
        try {
            const res = await fetch("/api/customer/barbershops");
            if (res.ok) {
                const data = await res.json();
                setBarbershops(data);
            }
        } catch (e) {
            console.error("Failed to fetch shops");
        }
    }

    async function submitBooking() {
        if (!selectedShop || !selectedCapster || !selectedService || !date || !time) return;
        setLoading(true);
        try {
            const dateTime = new Date(`${date}T${time}`);
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barbershopId: selectedShop.id,
                    capsterId: selectedCapster.id,
                    serviceId: selectedService.id,
                    date: dateTime.toISOString()
                })
            });
            if (res.ok) {
                alert("Booking Confirmed!");
                router.push("/dashboard");
            } else {
                const err = await res.json();
                alert("Booking failed: " + (err.error || "Unknown"));
            }
        } catch {
            alert("Error booking");
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

            {/* progress steps */}
            <div className="flex justify-between mb-8 border-b pb-4">
                <span className={`font-semibold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>1. Shop</span>
                <span className={`font-semibold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>2. Service</span>
                <span className={`font-semibold ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>3. Capster</span>
                <span className={`font-semibold ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>4. Time</span>
            </div>

            <div className="bg-white p-6 rounded shadow border min-h-[300px]">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Select Barbershop</h2>
                        <div className="grid gap-3">
                            {barbershops.map(shop => (
                                <button
                                    key={shop.id}
                                    onClick={() => { setSelectedShop(shop); setStep(2); }}
                                    className="text-left p-4 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                >
                                    <div className="font-bold">{shop.name}</div>
                                    <div className="text-sm text-gray-500">{shop.address}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && selectedShop && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Select Service</h2>
                            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">Back</button>
                        </div>
                        <div className="grid gap-3">
                            {selectedShop.services.length > 0 ? selectedShop.services.map(service => (
                                <button
                                    key={service.id}
                                    onClick={() => { setSelectedService(service); setStep(3); }}
                                    className="flex justify-between items-center p-4 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors w-full"
                                >
                                    <span className="font-medium">{service.name} ({service.duration}m)</span>
                                    <span className="font-bold">${service.price}</span>
                                </button>
                            )) : <p>No services available.</p>}
                        </div>
                    </div>
                )}

                {step === 3 && selectedShop && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Select Capster</h2>
                            <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700">Back</button>
                        </div>
                        <div className="grid gap-3">
                            {selectedShop.capsters.length > 0 ? selectedShop.capsters.map(capster => (
                                <button
                                    key={capster.id}
                                    onClick={() => { setSelectedCapster(capster); setStep(4); }}
                                    className="text-left p-4 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors w-full"
                                >
                                    <div className="font-medium">{capster.user.name || "Unknown Capster"}</div>
                                    <div className="text-sm text-gray-500">{capster.specialization || "General"}</div>
                                </button>
                            )) : <p>No capsters available.</p>}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Select Date & Time</h2>
                            <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-gray-700">Back</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full border p-2 rounded"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <p className="mb-2 text-sm text-gray-600">
                                    Booking <strong>{selectedService?.name}</strong> with <strong>{selectedCapster?.user.name}</strong> at <strong>{selectedShop?.name}</strong>.
                                </p>
                                <button
                                    onClick={submitBooking}
                                    disabled={!date || !time || loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {loading ? "Confirming..." : "Confirm Booking"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

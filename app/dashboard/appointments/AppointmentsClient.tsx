"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button/button";
import { FaCalendarCheck, FaCheck, FaTimes, FaCheckDouble } from "react-icons/fa";

type Appointment = {
    id: string;
    date: Date;
    status: string;
    service: { name: string; duration: number; price: number };
    barbershop: { name: string };
    team: { user: { name: string | null } };
    customer: { name: string | null; email: string };
};

export default function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
    const router = useRouter();
    const [filter, setFilter] = useState("ALL");
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filteredAppointments = appointments.filter((appt) => {
        if (filter === "ALL") return true;
        return appt.status === filter;
    });

    const handleUpdateStatus = async (id: string, status: string) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            router.refresh(); // Refresh data
        } catch (error) {
            console.error(error);
            alert("Failed to update appointment status");
        } finally {
            setLoadingId(null);
        }
    };

    const tabs = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

    return (
        <div className="p-6 max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                <FaCalendarCheck className="text-blue-500" />
                Appointments
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === tab
                                ? "bg-white text-black scale-105"
                                : "bg-white/10 text-gray-400 hover:bg-white/20"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredAppointments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center text-gray-500 py-10"
                        >
                            No appointments found.
                        </motion.div>
                    ) : (
                        filteredAppointments.map((appt) => (
                            <motion.div
                                key={appt.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-4 relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 right-0 p-2 px-4 rounded-bl-xl text-xs font-bold ${appt.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                        appt.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-500' :
                                            appt.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                                                'bg-red-500/20 text-red-500'
                                    }`}>
                                    {appt.status}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{appt.service.name}</h3>
                                    <p className="text-gray-400 text-sm">{new Date(appt.date).toLocaleString()}</p>
                                </div>

                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Customer:</span>
                                        <span className="font-semibold text-white">{appt.customer.name || appt.customer.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Team:</span>
                                        <span className="font-semibold text-white">{appt.team.user.name || "Unassigned"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span className="font-semibold text-white">${appt.service.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span className="font-semibold text-white">{appt.service.duration} mins</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-2 pt-4">
                                    {appt.status === "PENDING" && (
                                        <>
                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                                                onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                                                disabled={loadingId === appt.id}
                                            >
                                                {loadingId === appt.id ? "..." : <><FaCheck className="mr-2" /> Confirm</>}
                                            </Button>
                                            <Button
                                                className="bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-200 border border-red-500/50 flex-1"
                                                onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                                                disabled={loadingId === appt.id}
                                            >
                                                <FaTimes className="mr-2" /> Cancel
                                            </Button>
                                        </>
                                    )}
                                    {appt.status === "CONFIRMED" && (
                                        <>
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                                onClick={() => handleUpdateStatus(appt.id, "COMPLETED")}
                                                disabled={loadingId === appt.id}
                                            >
                                                {loadingId === appt.id ? "..." : <><FaCheckDouble className="mr-2" /> Complete</>}
                                            </Button>
                                            <Button
                                                className="bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-200 border border-red-500/50 flex-1"
                                                onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                                                disabled={loadingId === appt.id}
                                            >
                                                <FaTimes className="mr-2" /> Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

type Appointment = {
    id: string;
    date: Date;
    status: string;
    service: { name: string; duration: number };
    customer: { name: string | null };
    capster: { user: { name: string | null } };
};

export default function Timeline({ appointments }: { appointments: Appointment[] }) {
    // Generate dates for the vertical axis (e.g., today + next 6 days)
    const dates = useMemo(() => {
        const today = new Date();
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    }, []);

    // Helper to format date label
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
    };

    // Helper to calculate position and width
    // Assuming 08:00 start, 22:00 end (14 hours total)
    const START_HOUR = 8;
    const TOTAL_HOURS = 14;

    const getPosition = (date: Date, durationMinutes: number) => {
        const hour = date.getHours();
        const minutes = date.getMinutes();
        const timeInHours = hour + minutes / 60;

        // Clamping to visual range
        if (timeInHours < START_HOUR) return { left: 0, width: 0, visible: false }; // Before open
        if (timeInHours > START_HOUR + TOTAL_HOURS) return { left: 0, width: 0, visible: false }; // After close

        const offsetHours = timeInHours - START_HOUR;
        const leftPercent = (offsetHours / TOTAL_HOURS) * 100;
        const widthPercent = (durationMinutes / 60 / TOTAL_HOURS) * 100;

        return { left: `${leftPercent}%`, width: `${widthPercent}%`, visible: true };
    };

    // Filter appointments for each day
    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter(appt => {
            const apptDate = new Date(appt.date);
            return apptDate.getDate() === day.getDate() &&
                apptDate.getMonth() === day.getMonth() &&
                apptDate.getFullYear() === day.getFullYear();
        });
    };

    return (
        <div className="bg-[#1a1a1a] rounded-3xl p-8 w-full max-w-4xl mx-auto mt-8 border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Appointments Timeline</h2>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400"></span> Confirmed</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Pending</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400"></span> Cancelled</div>
                </div>
            </div>

            <div className="relative">
                {/* Vertical Guidelines (Hours) */}
                <div className="absolute inset-0 flex justify-between pointer-events-none pl-16 opacity-10">
                    {[...Array(TOTAL_HOURS / 2 + 1)].map((_, i) => (
                        <div key={i} className="h-full border-l border-white w-px mx-auto"></div>
                    ))}
                </div>

                {/* Timeline Rows */}
                <div className="space-y-6">
                    {dates.map((date) => {
                        const dayAppointments = getAppointmentsForDay(date);

                        return (
                            <div key={date.toISOString()} className="flex items-center group">
                                {/* Date Label */}
                                <div className="w-16 text-right pr-6 font-mono text-gray-500 font-bold group-hover:text-white transition-colors">
                                    {formatDate(date)}
                                </div>

                                {/* Timeline Track */}
                                <div className="flex-1 h-12 relative border-l border-white/10">
                                    {dayAppointments.map((appt) => {
                                        const { left, width, visible } = getPosition(new Date(appt.date), appt.service.duration);
                                        if (!visible) return null;

                                        let bgColor = "bg-gray-500";
                                        if (appt.status === "CONFIRMED" || appt.status === "COMPLETED") bgColor = "bg-green-400 text-black";
                                        else if (appt.status === "PENDING") bgColor = "bg-yellow-400 text-black";
                                        else if (appt.status === "CANCELLED") bgColor = "bg-red-400 text-white";

                                        return (
                                            <motion.div
                                                key={appt.id}
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-full ${bgColor} flex items-center px-3 shadow-lg cursor-pointer hover:brightness-110 z-10 transition-all group/item`}
                                                style={{ left, width, minWidth: "40px" }}
                                                title={`${appt.service.name} | Cust: ${appt.customer.name} | Cap: ${appt.capster?.user?.name}`}
                                            >
                                                <div className="overflow-hidden whitespace-nowrap text-xs font-bold flex gap-2">
                                                    {/* Show Time if space allows */}
                                                    {dayAppointments.length < 5 && (
                                                        <span className="opacity-80">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    )}
                                                    {/* Show Customer Initial if space allows */}
                                                    <span className="opacity-90 truncate">{appt.customer.name?.split(' ')[0]}</span>
                                                </div>

                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/item:block bg-[#2a2a2a] border border-white/10 text-white text-xs p-3 rounded-lg whitespace-nowrap z-50 shadow-xl">
                                                    <div className="font-bold text-sm mb-1 text-white">{appt.service.name}</div>
                                                    <div className="text-gray-400">Customer: <span className="text-white">{appt.customer.name}</span></div>
                                                    <div className="text-gray-400">Capster: <span className="text-white">{appt.capster?.user?.name || "Unassigned"}</span></div>
                                                    <div className="text-gray-500 mt-1 text-[10px]">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.status}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* X-Axis Labels (Time) */}
                <div className="flex justify-between pl-16 mt-4 text-xs font-mono text-gray-600">
                    <span>08:00</span>
                    <span>12:00</span>
                    <span>16:00</span>
                    <span>20:00</span>
                    <span>22:00</span>
                </div>
            </div>
        </div>
    );
}

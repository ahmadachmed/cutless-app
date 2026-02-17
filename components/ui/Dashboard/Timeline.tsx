"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

type Appointment = {
    id: string;
    date: Date;
    status: string;
    service: { name: string; duration: number };
    customer: { name: string | null };
    team: { user: { name: string | null } };
};

type AppointmentWithLane = Appointment & { lane: number };

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
    const START_HOUR = 10;
    const TOTAL_HOURS = 12;

    const getPosition = (date: Date, durationMinutes: number, dayReference: Date) => {
        // Create 08:00 start time for the specific day
        const startTime = new Date(dayReference);
        startTime.setHours(START_HOUR, 0, 0, 0);

        const timeDiff = date.getTime() - startTime.getTime();
        const totalDurationMs = TOTAL_HOURS * 60 * 60 * 1000;

        // Clamping
        if (timeDiff < 0) return { left: 0, width: 0, visible: false };
        if (timeDiff > totalDurationMs) return { left: 0, width: 0, visible: false };

        const leftPercent = (timeDiff / totalDurationMs) * 100;
        const widthPercent = ((durationMinutes * 60 * 1000) / totalDurationMs) * 100;

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
        <div className="rounded-3xl p-8 w-full mx-auto mt-8 border border-white/5">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Appointments Timeline</h2>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400"></span> Confirmed</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Pending</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400"></span> Cancelled</div>
                </div>
            </div>

            <div className="relative">
                {/* Vertical Guidelines (Hours) */}
                <div className="absolute inset-0 flex justify-between pointer-events-none pl-16 opacity-10">
                    {[...Array(TOTAL_HOURS + 1)].map((_, i) => (
                        <div key={i} className="h-full border-l border-gray-900 w-px mx-auto"></div>
                    ))}
                </div>

                {/* Timeline Rows */}
                <div className="space-y-6">
                    {dates.map((date) => {
                        const dayAppointments = getAppointmentsForDay(date);

                        // Calculate lanes for overlapping appointments
                        // Sort by start time (though likely already sorted, good to ensure)
                        const sortedAppointments = [...dayAppointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                        const lanes: AppointmentWithLane[][] = [];
                        const appointmentsWithLanes: AppointmentWithLane[] = sortedAppointments.map(appt => ({ ...appt, lane: 0 }));

                        appointmentsWithLanes.forEach(appt => {
                            let laneIndex = 0;
                            let placed = false;

                            const apptStart = new Date(appt.date).getTime();
                            const apptEnd = apptStart + (appt.service.duration * 60 * 1000);

                            while (!placed) {
                                if (!lanes[laneIndex]) {
                                    lanes[laneIndex] = [appt];
                                    placed = true;
                                } else {
                                    // Check for overlap with any appointment in this lane
                                    const hasOverlap = lanes[laneIndex].some(existingAppt => {
                                        const existingStart = new Date(existingAppt.date).getTime();
                                        const existingEnd = existingStart + (existingAppt.service.duration * 60 * 1000);
                                        // Overlap if (StartA < EndB) and (EndA > StartB)
                                        return (apptStart < existingEnd && apptEnd > existingStart);
                                    });

                                    if (!hasOverlap) {
                                        lanes[laneIndex].push(appt);
                                        placed = true;
                                    } else {
                                        laneIndex++;
                                    }
                                }
                            }
                            // Store the lane index for this appointment
                            appt.lane = laneIndex;
                        });

                        const maxLane = lanes.length > 0 ? lanes.length : 1;
                        const rowHeight = Math.max(48, maxLane * 40 + 16); // Base 48px or dynamic

                        return (
                            <div key={date.toISOString()} className="flex items-start group">
                                {/* Date Label */}
                                <div className="w-16 text-right pr-6 font-mono text-gray-400 font-bold group-hover:text-gray-900 transition-colors pt-3">
                                    {formatDate(date)}
                                </div>

                                {/* Timeline Track */}
                                <div className="flex-1 relative border-l border-gray-200" style={{ height: `${rowHeight}px` }}>
                                    {appointmentsWithLanes.map((appt) => {
                                        const { left, width, visible } = getPosition(new Date(appt.date), appt.service.duration, date);
                                        if (!visible) return null;

                                        let bgColor = "bg-gray-200 text-gray-600";
                                        if (appt.status === "CONFIRMED" || appt.status === "COMPLETED") bgColor = "bg-green-400 text-black";
                                        else if (appt.status === "PENDING") bgColor = "bg-yellow-400 text-black";
                                        else if (appt.status === "CANCELLED") bgColor = "bg-red-400 text-white";

                                        const top = appt.lane * 36 + 8; // 36px per lane + 8px padding

                                        return (
                                            <motion.div
                                                key={appt.id}
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                className={`absolute h-8 rounded-full ${bgColor} flex items-center px-3 shadow-sm cursor-pointer hover:shadow-md z-10 transition-all group/item`}
                                                style={{ left, width, minWidth: "40px", top: `${top}px` }}
                                                title={`${appt.service.name} | Cust: ${appt.customer.name} | Team: ${appt.team?.user?.name}`}
                                            >
                                                <div className="overflow-hidden whitespace-nowrap text-xs font-bold flex gap-2 w-full">
                                                    {/* Show Time if space allows */}
                                                    {dayAppointments.length < 5 && (
                                                        <span className="opacity-80">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    )}
                                                    {/* Show Customer Initial if space allows */}
                                                    <span className="opacity-90 truncate">{appt.customer.name}</span>
                                                </div>

                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/item:block bg-gray-900 text-white text-xs p-3 rounded-lg whitespace-nowrap z-50 shadow-xl">
                                                    <div className="font-bold text-sm mb-1 text-white">{appt.service.name}</div>
                                                    <div className="text-gray-300">Customer: <span className="text-white">{appt.customer.name}</span></div>
                                                    <div className="text-gray-300">Team: <span className="text-white">{appt.team?.user?.name || "Unassigned"}</span></div>
                                                    <div className="text-gray-400 mt-1 text-[10px]">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.status}</div>
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
                <div className="flex justify-between pl-16 mt-4 text-xs font-mono text-gray-400">
                    {[...Array(TOTAL_HOURS + 1)].map((_, i) => {
                        const hour = START_HOUR + i;
                        return <span key={hour}>{hour.toString().padStart(2, '0')}:00</span>;
                    })}
                </div>
            </div>
        </div>
    );
}

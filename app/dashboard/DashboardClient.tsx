"use client";

import { useState } from "react";
import Link from "next/link";

import Timeline from "@/components/ui/Dashboard/Timeline";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { FaCalendarCheck } from "react-icons/fa";
import { CircularProgress } from "@/components/ui/Progress/CircularProgress";


type Barbershop = {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
    subscriptionPlan: string;
    teams?: { id: string }[];
};

type Appointment = {
    id: string;
    barbershopId: string;
    date: Date;
    status: string;
    service: { name: string; duration: number };
    customer: { name: string | null };
    team: { user: { name: string | null } };
    [key: string]: unknown;
};

export default function DashboardClient({ barbershops, appointmentCounts, appointments }: { barbershops: Barbershop[], appointmentCounts?: Record<string, { pending: number; confirmed: number; cancelled: number }>, appointments: Appointment[] }) {
    const [selectedShopId, setSelectedShopId] = useState<string>(
        barbershops.length > 0 ? barbershops[0].id : ""
    );
    const pending = appointmentCounts?.[selectedShopId]?.pending || 0;
    const confirmed = appointmentCounts?.[selectedShopId]?.confirmed || 0;
    const cancelled = appointmentCounts?.[selectedShopId]?.cancelled || 0;
    const total = pending + confirmed + cancelled;

    const selectedShop = barbershops.find((shop) => shop.id === selectedShopId);

    if (barbershops.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 p-8 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Barbershops Found</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    It looks like you haven&apos;t set up your barbershop yet. Create your first store to start managing appointments and team members.
                </p>
                <Link
                    href="/dashboard/barbershops"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Create New Store
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#F3F3F3] p-5 rounded-3xl">
            <div className="flex flex-col gap-1.5 mb-6">
                <h2 className="text-5xl font-light">Dashboard</h2>
                <p className="text-gray-500">Manage your barbershops and appointments</p>
            </div>


            {/* Tabs */}
            <Tabs
                tabs={barbershops.map(shop => ({ id: shop.id, label: shop.name }))}
                activeTab={selectedShopId}
                onChange={setSelectedShopId}
                className="mb-6"
            />

            {/* Content */}
            {selectedShop && (
                <div className="flex flex-col gap-6">
                    {/* Top Row: Info and Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Teams Card */}
                        <Link href="/dashboard/teams" className="bg-[#EAEEEB] rounded-lg shadow p-6 border border-gray-100 flex flex-col justify-between hover:border-blue-200 transition-colors group">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Teams</h3>
                                <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-gray-900">{selectedShop.teams?.length || 0}</p>
                                <p className="text-sm text-gray-500 mt-1">Active staff members</p>
                            </div>
                        </Link>

                        {/* Appointments Status Card */}
                        <Link href={`/dashboard/appointments`} className={`rounded-lg p-6 flex flex-col justify-between h-full ${(appointmentCounts?.[selectedShop.id]?.pending || 0) > 0
                            ? "bg-[#F0FAA1] border-[#F0FAA1]"
                            : "bg-[#EAEEEB] border-red-200"
                            }`}>
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-white rounded-2xl">
                                    <FaCalendarCheck />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Appointment Status</h3>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-baseline gap-2 relative">
                                    <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold flex items-center gap-2 absolute transform translate-x-1/2">
                                        {(() => {
                                            const ratio = (total === 0 || pending === 0) ? 1 : (confirmed / total);
                                            const percentageDisplay = Math.round(ratio * 100);

                                            return (
                                                <>
                                                    {percentageDisplay}%
                                                    <CircularProgress value={percentageDisplay} />
                                                </>
                                            );
                                        })()}
                                    </span>
                                    <span className="text-6xl font-normal text-gray-900 tracking-tight">
                                        {pending}
                                    </span>
                                    <span className="text-gray-500 font-medium">
                                        / {total - pending || 0} Confirmed
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-1.5 mt-6 h-12">
                                {(() => {
                                    const percentage = (total === 0 || pending === 0) ? 1 : (confirmed / total);

                                    const filledCount = Math.round(percentage * 8);

                                    return Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-full border-2 ${i < filledCount
                                                ? "bg-[#1a1a1a] border-[#1a1a1a]"
                                                : "border-gray-300 border-dashed"
                                                }`}
                                        />
                                    ));
                                })()}
                            </div>
                        </Link>

                        {/* Barbershop Info Card */}
                        <div className="bg-[#EAEEEB] rounded-lg shadow p-6 border border-gray-100 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">{selectedShop.name}</h2>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                                        {selectedShop.subscriptionPlan} Plan
                                    </span>
                                </div>
                                <div className="space-y-3 text-gray-600">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Address</p>
                                        <p>{selectedShop.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Phone</p>
                                        <p>{selectedShop.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-[#EAEEEB] rounded-lg shadow p-6 border border-gray-100">
                        <Timeline appointments={appointments.filter(a => a.barbershopId === selectedShop.id)} />
                    </div>
                </div>
            )}
        </div>
    );
}

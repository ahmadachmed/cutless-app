"use client";

import { useState } from "react";
import Link from "next/link";

type Barbershop = {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
    subscriptionPlan: string;
    capsters?: { id: string }[];
};

export default function DashboardClient({ barbershops, appointmentCounts }: { barbershops: Barbershop[], appointmentCounts?: Record<string, { pending: number; confirmed: number }> }) {
    const [selectedShopId, setSelectedShopId] = useState<string>(
        barbershops.length > 0 ? barbershops[0].id : ""
    );

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
                    It looks like you haven't set up your barbershop yet. Create your first store to start managing appointments and capsters.
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
        <div className="py-4">

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {barbershops.map((shop) => (
                    <button
                        key={shop.id}
                        onClick={() => setSelectedShopId(shop.id)}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedShopId === shop.id
                            ? "bg-gray-900 text-white shadow-sm"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                            }`}
                    >
                        {shop.name}
                    </button>
                ))}
            </div>

            {/* Content */}
            {selectedShop && (
                <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
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

                        <div className="pt-4 border-t border-gray-100 flex gap-4">
                            <Link href="/dashboard/capsters" className="flex-1 block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                                <p className="text-sm font-medium text-blue-600 mb-1 group-hover:text-blue-700">Capsters</p>
                                <p className="text-2xl font-bold text-blue-900 group-hover:text-blue-950">
                                    {selectedShop.capsters?.length || 0}
                                </p>
                            </Link>
                            <Link href="/dashboard/appointments" className="flex-1 block p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group">
                                <p className="text-sm font-medium text-yellow-600 mb-1 group-hover:text-yellow-700">Pending Appts</p>
                                <p className="text-2xl font-bold text-yellow-900 group-hover:text-yellow-950">
                                    {appointmentCounts?.[selectedShop.id]?.pending || 0}
                                </p>
                            </Link>
                            <Link href="/dashboard/appointments" className="flex-1 block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                                <p className="text-sm font-medium text-green-600 mb-1 group-hover:text-green-700">Confirmed</p>
                                <p className="text-2xl font-bold text-green-900 group-hover:text-green-950">
                                    {appointmentCounts?.[selectedShop.id]?.confirmed || 0}
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

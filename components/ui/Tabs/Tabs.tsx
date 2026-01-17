"use client";

import React from "react";

export type TabItem = {
    id: string;
    label: string;
};

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className = "" }: TabsProps) => {
    return (
        <div className={`flex space-x-2 overflow-x-auto pb-2 ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

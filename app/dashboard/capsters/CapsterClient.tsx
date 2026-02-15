"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaUserTie, FaEnvelope, FaStore, FaCut } from "react-icons/fa";
import Modal from "@/components/ui/Modal/Modal";
import DeleteConfirmationModal from "@/components/ui/Modal/DeleteConfirmationModal";

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

export default function CapsterClient({ initialCapsters, initialBarbershops }: { initialCapsters: Capster[], initialBarbershops: Barbershop[] }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [capsters, setCapsters] = useState<Capster[]>(initialCapsters);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [barbershopId, setBarbershopId] = useState("");
    const [specialization, setSpecialization] = useState("");

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [barbershops, setBarbershops] = useState<Barbershop[]>(initialBarbershops);

    // Authentication check is handled by middleware or server component usually, 
    // but good to keep a check here too if needed, or rely on Server Component to redirect.



    const openAddModal = () => {
        setName("");
        setEmail("");
        setPassword("");
        setBarbershopId("");
        setSpecialization("");
        setIsAddModalOpen(true);
    };

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !email || !password || !barbershopId) {
            alert("Name, Email, Password, and Barbershop ID are required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/capsters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, barbershopId, specialization }),
                credentials: "include",
            });
            if (res.ok) {
                const newCapster = await res.json();
                // Optimistically update or re-fetch
                // For simplicity and consistency, let's re-fetch or append if the response is the full object
                // The API returns the new capster with inclusions.
                // Actually, previous implementation re-fetched the whole list.
                await fetch("/api/capsters", { credentials: "include" })
                    .then((res) => res.json())
                    .then(setCapsters);
                setIsAddModalOpen(false);
            }
            else {
                const data = await res.json();
                alert(data.error || "Failed to add capster");
            }
        } catch {
            alert("Error adding capster");
        }
        setLoading(false);
    }

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    async function handleDelete() {
        if (!deletingId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/capsters?id=${deletingId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setCapsters((prev) => prev.filter((c) => c.id !== deletingId));
                setIsDeleteModalOpen(false);
                setDeletingId(null);
            } else {
                alert("Failed to delete capster");
            }
        } catch {
            alert("Error deleting capster");
        }
        setLoading(false);
    }

    return (
        <div className="bg-[#F3F3F3] min-h-screen p-5 space-y-8 rounded-3xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-light text-gray-900">Teams</h1>
                    <p className="text-gray-500 mt-1">Manage your staff and their assignments</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md active:scale-95"
                >
                    <FaPlus />
                    <span className="font-medium">Add Member</span>
                </button>
            </div>

            {/* Content */}
            {capsters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50 text-gray-500">
                    <FaUserTie className="text-4xl mb-3 opacity-30" />
                    <p>No team members found. Add one to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"><p className="flex items-center gap-2"><FaUserTie className="text-gray-400 text-xs" />Name</p></th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"><p className="flex items-center gap-2"><FaEnvelope className="text-gray-400 text-xs" />Email</p></th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"><p className="flex items-center gap-2"><FaStore className="text-gray-400 text-xs" />Barbershop</p></th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"><p className="flex items-center gap-2"><FaCut className="text-gray-400 text-xs" />Specialization</p></th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {capsters.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-gray-900">{c.user?.name || "Unnamed"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            <div className="flex items-center gap-2">
                                                {c.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                {c.barbershop?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {c.specialization ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-medium border border-purple-100">
                                                    {c.specialization}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDeleteClick(c.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-2"
                                                title="Delete Member"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Team Member"
            >
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Barbershop</label>
                        <div className="relative">
                            <select
                                value={barbershopId}
                                onChange={(e) => setBarbershopId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all appearance-none"
                                required
                            >
                                <option value="">Select a Barbershop</option>
                                {barbershops.map((shop) => (
                                    <option key={shop.id} value={shop.id}>
                                        {shop.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization (Optional)</label>
                        <input
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            placeholder="e.g. Haircuts, Beard Trim"
                        />
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 py-3 px-4 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Remove Team Member?"
                description="Are you sure you want to remove this member? Use caution."
                isLoading={loading}
            />
        </div>
    );
}

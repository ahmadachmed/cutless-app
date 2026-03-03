"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaUserTie, FaEnvelope, FaStore, FaCut } from "react-icons/fa";
import Modal from "@/components/ui/Modal/Modal";
import DeleteConfirmationModal from "@/components/ui/Modal/DeleteConfirmationModal";

type Team = {
    id: string;
    specialization: string | null;
    user: { id: string; name: string | null; email: string; role: string };
    barbershop: { id: string; name: string };
};

type Barbershop = {
    id: string;
    name: string;
}

export default function TeamClient({ initialTeams, initialBarbershops }: { initialTeams: Team[], initialBarbershops: Barbershop[] }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [teams, setTeams] = useState<Team[]>(initialTeams);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [barbershopId, setBarbershopId] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [role, setRole] = useState("capster");
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [barbershops, setBarbershops] = useState<Barbershop[]>(initialBarbershops);

    const openAddModal = () => {
        setEditingId(null);
        setName("");
        setEmail("");
        setPassword("");
        setBarbershopId("");
        setSpecialization("");
        setRole("capster");
        setIsAddModalOpen(true);
    };

    const openEditModal = (team: Team) => {
        setEditingId(team.id);
        setName(team.user.name || "");
        setEmail(team.user.email);
        setPassword("");
        setBarbershopId(team.barbershop.id);
        setSpecialization(team.specialization || "");
        setRole(team.user.role || "capster");
        setIsAddModalOpen(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name || !email || (!editingId && !password) || !barbershopId) {
            alert("Name, Email, Password (for new users), and Barbershop ID are required");
            return;
        }

        setLoading(true);
        try {
            const url = editingId ? "/api/teams" : "/api/teams";
            const method = editingId ? "PUT" : "POST";
            const body = editingId
                ? { id: editingId, name, email, role, specialization }
                : { name, email, password, barbershopId, specialization, role };

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include",
            });

            if (res.ok) {
                await fetch("/api/teams", { credentials: "include" })
                    .then((res) => res.json())
                    .then(setTeams);
                setIsAddModalOpen(false);
                setEditingId(null);
            }
            else {
                const data = await res.json();
                alert(data.error || "Failed to save team member");
            }
        } catch {
            alert("Error saving team member");
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
            const res = await fetch(`/api/teams?id=${deletingId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setTeams((prev) => prev.filter((c) => c.id !== deletingId));
                setIsDeleteModalOpen(false);
                setDeletingId(null);
            } else {
                alert("Failed to delete team member");
            }
        } catch {
            alert("Error deleting team member");
        }
        setLoading(false);
    }

    return (
        <div className="bg-[#F3F3F3] min-h-screen p-5 space-y-8 rounded-3xl">
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

            {teams.length === 0 ? (
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
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"><p className="flex items-center gap-2"><FaUserTie className="text-gray-400 text-xs" />Role</p></th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"><p className="flex items-center gap-2"><FaCut className="text-gray-400 text-xs" />Specialization</p></th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {teams.map((c) => (
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${c.user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                    c.user?.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                                                        c.user?.role === 'co-owner' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-green-100 text-green-800'}`}>
                                                {c.user?.role}
                                            </span>
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
                                                onClick={() => openEditModal(c)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                                                title="Edit Member"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
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

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingId ? "Edit Team Member" : "Add Team Member"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingId && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            placeholder="••••••••"
                            required={!editingId}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <div className="relative">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all appearance-none"
                                required
                            >
                                <option value="capster">Capster</option>
                                <option value="admin">Admin</option>
                                <option value="co-owner">Co-Owner</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
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
                            {loading ? "Saving..." : (editingId ? "Save Changes" : "Add Member")}
                        </button>
                    </div>
                </form>
            </Modal>

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

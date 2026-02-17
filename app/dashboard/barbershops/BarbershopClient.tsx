"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaMapMarkerAlt, FaPhone, FaEdit, FaTrash, FaStore, FaClock, FaCalendar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmationModal from "@/components/ui/Modal/DeleteConfirmationModal";
import Modal from "@/components/ui/Modal/Modal";

type Barbershop = {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
    subscriptionPlan: string;
    openTime?: string | null;
    closeTime?: string | null;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    daysOpen?: string | null;
};

export default function BarbershopClient({ initialBarbershops }: { initialBarbershops: Barbershop[] }) {
    const router = useRouter();
    const [barbershops, setBarbershops] = useState<Barbershop[]>(initialBarbershops);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingShop, setEditingShop] = useState<Barbershop | null>(null);
    const [deletingShopId, setDeletingShopId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({});

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phoneNumber: "",
        subscriptionPlan: "free",
        openTime: "09:00",
        closeTime: "21:00",
        breakStartTime: "",
        breakEndTime: "",
        daysOpen: "Mon,Tue,Wed,Thu,Fri,Sat"
    });

    const resetForm = () => {
        setFormData({
            name: "",
            address: "",
            phoneNumber: "",
            subscriptionPlan: "free",
            openTime: "09:00",
            closeTime: "21:00",
            breakStartTime: "",
            breakEndTime: "",
            daysOpen: "Mon,Tue,Wed,Thu,Fri,Sat"
        });
        setEditingShop(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (shop: Barbershop) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name,
            address: shop.address,
            phoneNumber: shop.phoneNumber,
            subscriptionPlan: shop.subscriptionPlan,
            openTime: shop.openTime || "09:00",
            closeTime: shop.closeTime || "21:00",
            breakStartTime: shop.breakStartTime || "",
            breakEndTime: shop.breakEndTime || "",
            daysOpen: shop.daysOpen || "Mon,Tue,Wed,Thu,Fri,Sat"
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (id: string) => {
        setDeletingShopId(id);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingShopId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            const url = "/api/barbershops";
            const method = editingShop ? "PUT" : "POST";
            const body = editingShop ? { ...formData, id: editingShop.id } : formData;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.errors) {
                    setErrors(data.errors);
                }
                if (data.error) {
                    setErrors({ general: data.error });
                }
                return;
            }

            const savedShop = await res.json();

            if (editingShop) {
                setBarbershops(prev => prev.map(s => s.id === savedShop.id ? savedShop : s));
            } else {
                setBarbershops(prev => [...prev, savedShop]);
            }

            router.refresh();
            closeModal();
        } catch (error: unknown) {
            setErrors({ general: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingShopId) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/barbershops?id=${deletingShopId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to delete barbershop");
                return;
            }

            setBarbershops(prev => prev.filter(s => s.id !== deletingShopId));
            router.refresh();
            closeDeleteModal();
        } catch (error: unknown) {
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#F3F3F3] min-h-screen p-5 space-y-8 rounded-3xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-light text-gray-900">Barbershops</h1>
                    <p className="text-gray-500 mt-1">Manage your store locations and details</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md active:scale-95"
                >
                    <FaPlus />
                    <span className="font-medium">Add Barbershop</span>
                </button>
            </div>

            {/* Grid */}
            {barbershops.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50 text-gray-500">
                    <FaStore className="text-4xl mb-3 opacity-30" />
                    <p>No barbershops found. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbershops.map((shop) => (
                        <motion.div
                            key={shop.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-200 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                        <FaStore />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">{shop.name}</h3>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                                            {shop.subscriptionPlan}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(shop)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => openDeleteModal(shop.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start gap-3">
                                    <FaMapMarkerAlt className="mt-1 text-gray-400" />
                                    <span className="leading-relaxed">{shop.address}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaPhone className="text-gray-400" />
                                    <span>{shop.phoneNumber}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaClock className="mt-1 text-gray-400" />
                                    <div>
                                        <p>{shop.openTime || "09:00"} - {shop.closeTime || "21:00"}</p>
                                        {(shop.breakStartTime && shop.breakEndTime) && (
                                            <p className="text-xs text-gray-400">Break: {shop.breakStartTime} - {shop.breakEndTime}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaCalendar className="mt-1 text-gray-400" />
                                    <span className="leading-relaxed">{shop.daysOpen ? shop.daysOpen.split(",").join(", ") : "Mon-Sat"}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Edit/Add Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingShop ? "Edit Barbershop" : "Add Barbershop"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            placeholder="e.g. Cutlass Barbers"
                            required
                        />
                        {errors?.name && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.name) ? errors.name.join(", ") : errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all resize-none"
                            placeholder="Full address"
                            rows={3}
                            required
                        />
                        {errors?.address && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.address) ? errors.address.join(", ") : errors.address}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            placeholder="+1 234 567 890"
                            required
                        />
                        {errors?.phoneNumber && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.phoneNumber) ? errors.phoneNumber.join(", ") : errors.phoneNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                            <input
                                type="time"
                                value={formData.openTime}
                                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            />
                            {errors?.openTime && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.openTime) ? errors.openTime.join(", ") : errors.openTime}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                            <input
                                type="time"
                                value={formData.closeTime}
                                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            />
                            {errors?.closeTime && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.closeTime) ? errors.closeTime.join(", ") : errors.closeTime}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Break Start</label>
                            <input
                                type="time"
                                value={formData.breakStartTime}
                                onChange={(e) => setFormData({ ...formData, breakStartTime: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            />
                            {errors?.breakStartTime && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.breakStartTime) ? errors.breakStartTime.join(", ") : errors.breakStartTime}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Break End</label>
                            <input
                                type="time"
                                value={formData.breakEndTime}
                                onChange={(e) => setFormData({ ...formData, breakEndTime: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                            />
                            {errors?.breakEndTime && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.breakEndTime) ? errors.breakEndTime.join(", ") : errors.breakEndTime}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Days Open</label>
                        <div className="flex flex-wrap gap-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                        const currentDays = formData.daysOpen ? formData.daysOpen.split(",") : [];
                                        const newDays = currentDays.includes(day)
                                            ? currentDays.filter(d => d !== day)
                                            : [...currentDays, day];
                                        // Sort days to keep them in order
                                        const sorter = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
                                        newDays.sort((a, b) => (sorter[a as keyof typeof sorter] || 0) - (sorter[b as keyof typeof sorter] || 0));
                                        setFormData({ ...formData, daysOpen: newDays.join(",") });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.daysOpen?.includes(day)
                                        ? "bg-black text-white shadow-md"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                        <div className="relative">
                            <select
                                value={formData.subscriptionPlan}
                                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                                disabled={!!editingShop && (editingShop.subscriptionPlan === 'pro' || editingShop.subscriptionPlan === 'enterprise')}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        {editingShop && (editingShop.subscriptionPlan === 'pro' || editingShop.subscriptionPlan === 'enterprise') && (
                            <p className="text-xs text-gray-500 mt-2">
                                Subscription plans can only be upgraded or downgraded by contacting support.
                            </p>
                        )}
                    </div>

                    {errors?.general && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {Array.isArray(errors.general) ? errors.general.join(", ") : errors.general}
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 py-3 px-4 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Barbershop?"
                description="Are you sure you want to delete this barbershop? This action cannot be undone."
                isLoading={isLoading}
            />
        </div>
    );
}

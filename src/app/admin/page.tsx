"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Package, ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Search, RefreshCw, ChevronDown, User, Calendar, Euro, Trash2, TrendingUp, CreditCard, Plus, X, Save, FileText, Users, Eye, Tag, Briefcase } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { teamMembers } from "@/lib/config";

interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string | null;
  buyerDiscord: string | null;
  title: string;
  description: string | null;
  price: number;
  orderType: "CATALOG" | "PRIVATE";
  developers: string[];
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  purchaseDate: string;
  createdAt: string;
  product?: { id: string; name: string; category: string } | null;
}

interface Stats { totalOrders: number; pendingOrders: number; completedOrders: number; totalRevenue: number; }

interface OrderFormData {
  buyerName: string; buyerEmail: string; buyerDiscord: string; title: string; description: string;
  price: number; orderType: "CATALOG" | "PRIVATE"; developers: string[]; status: string; purchaseDate: string; productId: string;
}

const initialOrderForm: OrderFormData = {
  buyerName: "", buyerEmail: "", buyerDiscord: "", title: "", description: "", price: 0,
  orderType: "PRIVATE", developers: [], status: "PENDING", purchaseDate: new Date().toISOString().split("T")[0], productId: "",
};

const statusConfig = {
  PENDING: { label: "En attente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  CONFIRMED: { label: "Confirmée", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle },
  IN_PROGRESS: { label: "En cours", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Loader2 },
  COMPLETED: { label: "Terminée", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  CANCELLED: { label: "Annulée", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

const orderTypeConfig = {
  CATALOG: { label: "Catalogue", color: "bg-blue-500/20 text-blue-400" },
  PRIVATE: { label: "Privée", color: "bg-orange-500/20 text-orange-400" },
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormData>(initialOrderForm);
  const [savingOrder, setSavingOrder] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !session?.user?.isAdmin)) router.push("/admin/login");
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.isAdmin) { fetchOrders(); fetchStats(); fetchProducts(); }
  }, [session]);

  useEffect(() => { if (notification) { const t = setTimeout(() => setNotification(null), 4000); return () => clearTimeout(t); } }, [notification]);
  useEffect(() => { document.body.style.overflow = (showOrderModal || showDetailModal) ? "hidden" : "unset"; return () => { document.body.style.overflow = "unset"; }; }, [showOrderModal, showDetailModal]);

  const fetchOrders = async () => { try { const r = await fetch("/api/admin/orders"); if (r.ok) setOrders(await r.json()); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const fetchStats = async () => { try { const r = await fetch("/api/admin/stats"); if (r.ok) setStats(await r.json()); } catch (e) { console.error(e); } };
  const fetchProducts = async () => { try { const r = await fetch("/api/admin/products"); if (r.ok) setProducts(await r.json()); } catch (e) { console.error(e); } };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingOrder(true);
    if (!orderForm.buyerName.trim() || !orderForm.title.trim()) { setNotification({ type: "error", message: "Nom et titre requis" }); setSavingOrder(false); return; }
    try {
      const r = await fetch("/api/admin/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...orderForm, price: Number(orderForm.price), productId: orderForm.productId || null }) });
      if (r.ok) { setNotification({ type: "success", message: "Commande créée" }); await fetchOrders(); await fetchStats(); setShowOrderModal(false); setOrderForm(initialOrderForm); }
      else { const d = await r.json(); setNotification({ type: "error", message: d.error || "Erreur" }); }
    } catch (e) { setNotification({ type: "error", message: "Erreur connexion" }); } finally { setSavingOrder(false); }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (r.ok) { await fetchOrders(); await fetchStats(); setNotification({ type: "success", message: "Statut mis à jour" }); if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus as Order["status"] }); }
    } catch (e) { setNotification({ type: "error", message: "Erreur" }); }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    try { const r = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" }); if (r.ok) { await fetchOrders(); await fetchStats(); setNotification({ type: "success", message: "Commande supprimée" }); setShowDetailModal(false); } }
    catch (e) { setNotification({ type: "error", message: "Erreur" }); }
  };

  const toggleDeveloper = (dev: string) => {
    if (orderForm.developers.includes(dev)) setOrderForm({ ...orderForm, developers: orderForm.developers.filter((d) => d !== dev) });
    else setOrderForm({ ...orderForm, developers: [...orderForm.developers, dev] });
  };

  const filteredOrders = orders.filter((o) => {
    const s = o.title.toLowerCase().includes(searchQuery.toLowerCase()) || o.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return s && (statusFilter === "all" || o.status === statusFilter) && (typeFilter === "all" || o.orderType === typeFilter);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (status === "loading" || loading) return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-red animate-spin" /></div>;
  if (!session?.user?.isAdmin) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={cn("fixed top-24 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl", notification.type === "success" ? "bg-green-500/20 border border-green-500/30 text-green-400" : "bg-red-500/20 border border-red-500/30 text-red-400")}>
              {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}{notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-brand-red/20 border border-brand-red/30"><Shield className="w-6 h-6 text-brand-red" /></div>
                <h1 className="font-display text-3xl font-bold text-white">Panel Admin</h1>
              </div>
              <p className="text-gray-400">Bienvenue, {session.user.name}.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admin/catalogue" className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white rounded-xl"><Package className="w-4 h-4" />Catalogue</Link>
              <Link href="/admin/equipe" className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white rounded-xl"><Users className="w-4 h-4" />Équipe</Link>
              <Link href="/admin/partenaires" className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white rounded-xl"><Briefcase className="w-4 h-4" />Partenaires</Link>
              <button onClick={() => { fetchOrders(); fetchStats(); }} className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white rounded-xl"><RefreshCw className="w-4 h-4" />Actualiser</button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-dark-800 border border-dark-700"><div className="flex items-center justify-between mb-3"><div className="p-2 rounded-xl bg-blue-500/20"><ShoppingCart className="w-5 h-5 text-blue-400" /></div><TrendingUp className="w-4 h-4 text-green-400" /></div><p className="text-2xl font-display font-bold text-white">{stats?.totalOrders || 0}</p><p className="text-sm text-gray-400">Total</p></div>
          <div className="p-5 rounded-2xl bg-dark-800 border border-dark-700"><div className="flex items-center justify-between mb-3"><div className="p-2 rounded-xl bg-yellow-500/20"><Clock className="w-5 h-5 text-yellow-400" /></div></div><p className="text-2xl font-display font-bold text-white">{stats?.pendingOrders || 0}</p><p className="text-sm text-gray-400">En attente</p></div>
          <div className="p-5 rounded-2xl bg-dark-800 border border-dark-700"><div className="flex items-center justify-between mb-3"><div className="p-2 rounded-xl bg-green-500/20"><CheckCircle className="w-5 h-5 text-green-400" /></div></div><p className="text-2xl font-display font-bold text-white">{stats?.completedOrders || 0}</p><p className="text-sm text-gray-400">Terminées</p></div>
          <div className="p-5 rounded-2xl bg-dark-800 border border-dark-700"><div className="flex items-center justify-between mb-3"><div className="p-2 rounded-xl bg-brand-red/20"><Euro className="w-5 h-5 text-brand-red" /></div><CreditCard className="w-4 h-4 text-brand-red" /></div><p className="text-2xl font-display font-bold text-white">{stats?.totalRevenue?.toFixed(2) || "0.00"}€</p><p className="text-sm text-gray-400">Revenus</p></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" /><input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" /></div>
          <div className="flex flex-wrap gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white cursor-pointer"><option value="all">Tous statuts</option>{Object.entries(statusConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}</select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white cursor-pointer"><option value="all">Tous types</option><option value="CATALOG">Catalogue</option><option value="PRIVATE">Privée</option></select>
            <button onClick={() => setShowOrderModal(true)} className="flex items-center gap-2 px-5 py-3 bg-brand-red hover:bg-brand-red-light text-white font-medium rounded-xl"><Plus className="w-5 h-5" />Ajouter</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-dark-800 border border-dark-700 overflow-hidden">
          <div className="p-5 border-b border-dark-700"><h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-brand-red" />Commandes ({filteredOrders.length})</h2></div>
          {filteredOrders.length > 0 ? (
            <div className="divide-y divide-dark-700">
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <div key={order.id} onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }} className="p-4 md:p-5 hover:bg-dark-700/50 cursor-pointer transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{order.title}</h3>
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", orderTypeConfig[order.orderType].color)}>{orderTypeConfig[order.orderType].label}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{order.buyerName}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(order.purchaseDate).toLocaleDateString("fr-FR")}</span>
                          {order.developers.length > 0 && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{order.developers.join(", ")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-brand-red">{order.price.toFixed(2)}€</span>
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", statusConfig[order.status].color)}><StatusIcon className="w-3 h-3" />{statusConfig[order.status].label}</span>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-white mb-2">Aucune commande</h3>
              <button onClick={() => setShowOrderModal(true)} className="inline-flex items-center gap-2 px-5 py-3 bg-brand-red text-white font-medium rounded-xl"><Plus className="w-5 h-5" />Ajouter</button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Ajouter Commande */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-[9999]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-start justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-8 rounded-2xl bg-dark-800 border border-dark-700 shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-dark-700">
                  <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Plus className="w-5 h-5 text-brand-red" />Nouvelle commande</h2>
                  <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-lg hover:bg-dark-700"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleCreateOrder} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div><label className="block text-sm font-medium text-gray-300 mb-2"><Tag className="w-4 h-4 inline mr-2" />Type</label><div className="flex gap-3"><button type="button" onClick={() => setOrderForm({ ...orderForm, orderType: "PRIVATE", productId: "" })} className={cn("flex-1 px-4 py-3 rounded-xl border", orderForm.orderType === "PRIVATE" ? "bg-orange-500/20 border-orange-500/50 text-orange-400" : "bg-dark-700 border-dark-600 text-gray-400")}>Privée</button><button type="button" onClick={() => setOrderForm({ ...orderForm, orderType: "CATALOG" })} className={cn("flex-1 px-4 py-3 rounded-xl border", orderForm.orderType === "CATALOG" ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-dark-700 border-dark-600 text-gray-400")}>Catalogue</button></div></div>
                  {orderForm.orderType === "CATALOG" && <div><label className="block text-sm font-medium text-gray-300 mb-2"><Package className="w-4 h-4 inline mr-2" />Produit</label><select value={orderForm.productId} onChange={(e) => { const p = products.find((x) => x.id === e.target.value); setOrderForm({ ...orderForm, productId: e.target.value, title: p?.name || orderForm.title, price: p?.price || orderForm.price }); }} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white"><option value="">Sélectionner...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.price}€</option>)}</select></div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-300 mb-2"><User className="w-4 h-4 inline mr-2" />Acheteur *</label><input type="text" required value={orderForm.buyerName} onChange={(e) => setOrderForm({ ...orderForm, buyerName: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500" /></div><div><label className="block text-sm font-medium text-gray-300 mb-2">Discord</label><input type="text" value={orderForm.buyerDiscord} onChange={(e) => setOrderForm({ ...orderForm, buyerDiscord: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500" /></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="md:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-2"><FileText className="w-4 h-4 inline mr-2" />Titre *</label><input type="text" required value={orderForm.title} onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500" /></div><div><label className="block text-sm font-medium text-gray-300 mb-2"><Euro className="w-4 h-4 inline mr-2" />Prix (€)</label><input type="number" min="0" step="0.01" value={orderForm.price} onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white" /></div></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">Description</label><textarea rows={3} value={orderForm.description} onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 resize-none" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-300 mb-2"><Calendar className="w-4 h-4 inline mr-2" />Date</label><input type="date" value={orderForm.purchaseDate} onChange={(e) => setOrderForm({ ...orderForm, purchaseDate: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white" /></div><div><label className="block text-sm font-medium text-gray-300 mb-2">Statut</label><select value={orderForm.status} onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white">{Object.entries(statusConfig).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}</select></div></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2"><Briefcase className="w-4 h-4 inline mr-2" />Développeurs</label><div className="flex flex-wrap gap-2">{teamMembers.map((m) => <button key={m.id} type="button" onClick={() => toggleDeveloper(m.name)} className={cn("px-4 py-2 rounded-lg border", orderForm.developers.includes(m.name) ? "bg-brand-red/20 border-brand-red/50 text-brand-red" : "bg-dark-700 border-dark-600 text-gray-400")}>{m.name}</button>)}</div></div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-700"><button type="button" onClick={() => setShowOrderModal(false)} className="px-5 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl">Annuler</button><button type="submit" disabled={savingOrder} className="flex items-center gap-2 px-5 py-3 bg-brand-red hover:bg-brand-red-light disabled:opacity-50 text-white font-medium rounded-xl">{savingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Créer</button></div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Détail Commande */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-[9999]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-start justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-8 rounded-2xl bg-dark-800 border border-dark-700 shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-dark-700">
                  <div><h2 className="font-display text-xl font-bold text-white">{selectedOrder.title}</h2><p className="text-sm text-gray-400">#{selectedOrder.id.slice(0, 8)}</p></div>
                  <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-lg hover:bg-dark-700"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-5 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border", statusConfig[selectedOrder.status].color)}>{(() => { const Icon = statusConfig[selectedOrder.status].icon; return <Icon className="w-4 h-4" />; })()}{statusConfig[selectedOrder.status].label}</span>
                    <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium", orderTypeConfig[selectedOrder.orderType].color)}>{orderTypeConfig[selectedOrder.orderType].label}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-dark-700/50"><p className="text-xs text-gray-500 uppercase mb-1">Acheteur</p><p className="text-white font-medium">{selectedOrder.buyerName}</p>{selectedOrder.buyerDiscord && <p className="text-sm text-gray-400">{selectedOrder.buyerDiscord}</p>}</div>
                    <div className="p-4 rounded-xl bg-dark-700/50"><p className="text-xs text-gray-500 uppercase mb-1">Prix</p><p className="text-2xl font-bold text-brand-red">{selectedOrder.price.toFixed(2)}€</p></div>
                    <div className="p-4 rounded-xl bg-dark-700/50"><p className="text-xs text-gray-500 uppercase mb-1">Date</p><p className="text-white">{new Date(selectedOrder.purchaseDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                    <div className="p-4 rounded-xl bg-dark-700/50"><p className="text-xs text-gray-500 uppercase mb-1">Développeurs</p><p className="text-white">{selectedOrder.developers.length > 0 ? selectedOrder.developers.join(", ") : "Non assigné"}</p></div>
                  </div>
                  {selectedOrder.description && <div className="p-4 rounded-xl bg-dark-700/50"><p className="text-xs text-gray-500 uppercase mb-2">Description</p><p className="text-gray-300 whitespace-pre-wrap">{selectedOrder.description}</p></div>}
                  <div><p className="text-sm font-medium text-gray-300 mb-3">Changer le statut</p><div className="flex flex-wrap gap-2">{Object.entries(statusConfig).map(([k, c]) => <button key={k} onClick={() => updateOrderStatus(selectedOrder.id, k)} disabled={selectedOrder.status === k} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border", selectedOrder.status === k ? c.color : "bg-dark-700 border-dark-600 text-gray-400 hover:text-white")}><c.icon className="w-4 h-4" />{c.label}</button>)}</div></div>
                  <div className="flex justify-between pt-4 border-t border-dark-700"><button onClick={() => deleteOrder(selectedOrder.id)} className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" />Supprimer</button><button onClick={() => setShowDetailModal(false)} className="px-5 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl">Fermer</button></div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

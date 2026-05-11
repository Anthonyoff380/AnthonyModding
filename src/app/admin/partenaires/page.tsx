"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, Plus, Edit, Trash2, Loader2, X, Save, ArrowLeft, CheckCircle, AlertCircle, ImageIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  logo: string;
  website: string;
  description: string;
  order: number;
  isActive: boolean;
}

const initialForm: FormData = {
  name: "",
  logo: "",
  website: "",
  description: "",
  order: 0,
  isActive: true,
};

export default function PartnersAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !session?.user?.isAdmin)) {
      router.push("/admin/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.isAdmin) fetchPartners();
  }, [session]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [showModal]);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/admin/partners");
      if (res.ok) setPartners(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData(initialForm);
    setEditingId(null);
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (partner: Partner) => {
    setFormData({
      name: partner.name,
      logo: partner.logo,
      website: partner.website || "",
      description: partner.description || "",
      order: partner.order,
      isActive: partner.isActive,
    });
    setEditingId(partner.id);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.name.trim() || !formData.logo.trim()) {
      setNotification({ type: "error", message: "Nom et logo requis" });
      setSaving(false);
      return;
    }

    try {
      const url = modalMode === "create" ? "/api/admin/partners" : `/api/admin/partners/${editingId}`;
      const res = await fetch(url, {
        method: modalMode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setNotification({ type: "success", message: modalMode === "create" ? "Partenaire ajouté" : "Partenaire modifié" });
        await fetchPartners();
        setShowModal(false);
        setFormData(initialForm);
      } else {
        setNotification({ type: "error", message: "Erreur" });
      }
    } catch (e) {
      setNotification({ type: "error", message: "Erreur connexion" });
    } finally {
      setSaving(false);
    }
  };

  const deletePartner = async (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotification({ type: "success", message: "Partenaire supprimé" });
        await fetchPartners();
      }
    } catch (e) {
      setNotification({ type: "error", message: "Erreur" });
    }
  };

  const toggleActive = async (partner: Partner) => {
    try {
      await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !partner.isActive }),
      });
      await fetchPartners();
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-red animate-spin" /></div>;
  }

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
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"><ArrowLeft className="w-4 h-4" />Retour au dashboard</Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-brand-red/20 border border-brand-red/30"><Handshake className="w-6 h-6 text-brand-red" /></div>
                <h1 className="font-display text-3xl font-bold text-white">Partenaires</h1>
              </div>
              <p className="text-gray-400">Gérez vos partenaires.</p>
            </div>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-3 bg-brand-red hover:bg-brand-red-light text-white font-medium rounded-xl"><Plus className="w-5 h-5" />Ajouter</button>
          </div>
        </motion.div>

        {partners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {partners.map((partner) => (
              <motion.div key={partner.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("p-5 rounded-2xl bg-dark-800 border transition-colors", partner.isActive ? "border-dark-700" : "border-yellow-500/30 bg-yellow-500/5")}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden mb-3">
                    <Image src={partner.logo} alt={partner.name} width={64} height={64} className="object-contain" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{partner.name}</h3>
                  {!partner.isActive && <span className="text-xs text-yellow-400 mb-2">Inactif</span>}
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-red hover:underline flex items-center gap-1 mb-3">
                      <ExternalLink className="w-3 h-3" />Site web
                    </a>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => toggleActive(partner)} className={cn("flex-1 py-2 rounded-lg text-sm", partner.isActive ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400")}>
                    {partner.isActive ? "Actif" : "Inactif"}
                  </button>
                  <button onClick={() => openEditModal(partner)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deletePartner(partner.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-dark-800 border border-dark-700">
            <Handshake className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-white mb-2">Aucun partenaire</h3>
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-5 py-3 bg-brand-red text-white font-medium rounded-xl"><Plus className="w-5 h-5" />Ajouter</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-start justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg my-8 rounded-2xl bg-dark-800 border border-dark-700 shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-dark-700">
                  <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">{modalMode === "create" ? <><Plus className="w-5 h-5 text-brand-red" />Nouveau partenaire</> : <><Edit className="w-5 h-5 text-brand-red" />Modifier</>}</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-dark-700"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"><ImageIcon className="w-4 h-4 inline mr-2" />Logo (URL) *</label>
                    <input type="url" required value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"><ExternalLink className="w-4 h-4 inline mr-2" />Site web</label>
                    <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red resize-none" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-dark-700/50 rounded-xl">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded bg-dark-600 border-dark-500 text-brand-red" />
                    <div><p className="text-sm font-medium text-white">Actif</p><p className="text-xs text-gray-500">Afficher sur le site</p></div>
                  </label>
                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl">Annuler</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-brand-red hover:bg-brand-red-light disabled:opacity-50 text-white font-medium rounded-xl">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{modalMode === "create" ? "Créer" : "Enregistrer"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

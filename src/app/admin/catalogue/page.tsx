"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  X,
  Save,
  ArrowLeft,
  Grid,
  List,
  ChevronDown,
  ImageIcon,
  Tag,
  Euro,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  features: string[];
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string;
  _count?: { orders: number };
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  features: string[];
  isPublic: boolean;
  isFeatured: boolean;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  category: "",
  images: [],
  features: [],
  isPublic: true,
  isFeatured: false,
};

export default function CataloguePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [newImage, setNewImage] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
    else if (status === "authenticated" && !session?.user?.isAdmin) router.push("/admin/login");
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.isAdmin) fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) setProducts(await response.json());
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      features: product.features,
      isPublic: product.isPublic,
      isFeatured: product.isFeatured,
    });
    setEditingId(product.id);
    setModalMode("edit");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormData);
    setEditingId(null);
    setNewFeature("");
    setNewImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.name.trim() || !formData.description.trim() || !formData.category) {
      setNotification({ type: "error", message: "Nom, description et catégorie requis" });
      setSaving(false);
      return;
    }

    try {
      const url = modalMode === "create" ? "/api/admin/products" : `/api/admin/products/${editingId}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: Number(formData.price) }),
      });

      if (response.ok) {
        setNotification({ type: "success", message: modalMode === "create" ? "Véhicule créé !" : "Véhicule modifié !" });
        await fetchProducts();
        closeModal();
      } else {
        const data = await response.json();
        setNotification({ type: "error", message: data.message || data.error || "Erreur" });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Erreur de connexion" });
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Supprimer ce véhicule ?")) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (response.ok) {
        setNotification({ type: "success", message: "Véhicule supprimé" });
        await fetchProducts();
      } else {
        const data = await response.json();
        setNotification({ type: "error", message: data.message || "Erreur" });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Erreur" });
    }
  };

  const toggleVisibility = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !product.isPublic }),
      });
      await fetchProducts();
      setNotification({ type: "success", message: product.isPublic ? "Masqué" : "Visible" });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      await fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature("");
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage("");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    );
  }

  if (!session?.user?.isAdmin) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={cn("fixed top-24 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl", notification.type === "success" ? "bg-green-500/20 border border-green-500/30 text-green-400" : "bg-red-500/20 border border-red-500/30 text-red-400")}>
              {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />Retour au dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-brand-red/20 border border-brand-red/30">
                  <Package className="w-6 h-6 text-brand-red" />
                </div>
                <h1 className="font-display text-3xl font-bold text-white">Catalogue</h1>
              </div>
              <p className="text-gray-400">Gérez vos véhicules du catalogue public.</p>
            </div>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-3 bg-brand-red hover:bg-brand-red-light text-white font-medium rounded-xl transition-colors">
              <Plus className="w-5 h-5" />Ajouter un véhicule
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" />
          </div>
          <div className="flex gap-3">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white cursor-pointer">
              <option value="all">Toutes catégories</option>
              {siteConfig.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
            </select>
            <div className="flex bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={cn("p-3", viewMode === "grid" ? "bg-brand-red text-white" : "text-gray-400")}><Grid className="w-5 h-5" /></button>
              <button onClick={() => setViewMode("list")} className={cn("p-3", viewMode === "list" ? "bg-brand-red text-white" : "text-gray-400")}><List className="w-5 h-5" /></button>
            </div>
          </div>
        </motion.div>

        {/* Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {filteredProducts.length > 0 ? (
            <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
              {filteredProducts.map((product) => (
                <div key={product.id} className={cn("group rounded-2xl bg-dark-800 border border-dark-700 overflow-hidden hover:border-brand-red/50 transition-all", viewMode === "list" && "flex")}>
                  <div className={cn("relative bg-dark-700 flex items-center justify-center", viewMode === "grid" ? "h-40" : "h-24 w-24 flex-shrink-0")}>
                    {product.images[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-dark-600" />}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {!product.isPublic && <span className="px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-xs flex items-center gap-1"><EyeOff className="w-3 h-3" />Masqué</span>}
                      {product.isFeatured && <span className="px-2 py-1 rounded-md bg-brand-red/20 text-brand-red text-xs flex items-center gap-1"><Star className="w-3 h-3" />Vedette</span>}
                    </div>
                  </div>
                  <div className={cn("p-4 flex-1", viewMode === "list" && "flex items-center justify-between gap-4")}>
                    <div className={viewMode === "list" ? "flex-1 min-w-0" : ""}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-white truncate">{product.name}</h3>
                          <p className="text-xs text-gray-500">{siteConfig.categories.find((c) => c.id === product.category)?.icon} {siteConfig.categories.find((c) => c.id === product.category)?.name}</p>
                        </div>
                        {viewMode === "grid" && <span className="text-lg font-bold text-brand-red flex-shrink-0">{product.price}€</span>}
                      </div>
                      {viewMode === "grid" && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{product.description}</p>}
                    </div>
                    {viewMode === "list" && <span className="text-xl font-bold text-brand-red">{product.price}€</span>}
                    <div className={cn("flex items-center gap-2", viewMode === "grid" && "mt-4 pt-4 border-t border-dark-700")}>
                      <button onClick={() => toggleVisibility(product)} className={cn("p-2 rounded-lg", product.isPublic ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400")} title={product.isPublic ? "Masquer" : "Afficher"}>
                        {product.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => toggleFeatured(product)} className={cn("p-2 rounded-lg", product.isFeatured ? "bg-brand-red/20 text-brand-red" : "bg-dark-600 text-gray-400")} title="Vedette">
                        <Star className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditModal(product)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-dark-800 border border-dark-700">
              <Package className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-white mb-2">Catalogue vide</h3>
              <p className="text-gray-400 mb-6">Ajoutez votre premier véhicule au catalogue.</p>
              <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-5 py-3 bg-brand-red hover:bg-brand-red-light text-white font-medium rounded-xl">
                <Plus className="w-5 h-5" />Ajouter un véhicule
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-start justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-8 rounded-2xl bg-dark-800 border border-dark-700 shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-dark-700">
                  <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    {modalMode === "create" ? <><Plus className="w-5 h-5 text-brand-red" />Ajouter un véhicule</> : <><Edit className="w-5 h-5 text-brand-red" />Modifier</>}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-dark-700"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"><Tag className="w-4 h-4 inline mr-2" />Nom *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: FPT Renault D14" className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"><FileText className="w-4 h-4 inline mr-2" />Description *</label>
                    <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description..." className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2"><Euro className="w-4 h-4 inline mr-2" />Prix (€) *</label>
                      <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-brand-red" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2"><Package className="w-4 h-4 inline mr-2" />Catégorie *</label>
                      <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white cursor-pointer">
                        <option value="">Sélectionner...</option>
                        {siteConfig.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"><ImageIcon className="w-4 h-4 inline mr-2" />Images (URLs)</label>
                    <div className="flex gap-2 mb-2">
                      <input type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="https://..." className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" />
                      <button type="button" onClick={addImage} className="px-4 py-3 bg-dark-600 hover:bg-dark-500 text-white rounded-xl"><Plus className="w-5 h-5" /></button>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((img, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg">
                            <span className="text-sm text-gray-300 truncate max-w-[150px]">{img}</span>
                            <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })} className="text-red-400"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Caractéristiques</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder="Ex: Intérieur HD" className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-red" />
                      <button type="button" onClick={addFeature} className="px-4 py-3 bg-dark-600 hover:bg-dark-500 text-white rounded-xl"><Plus className="w-5 h-5" /></button>
                    </div>
                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((f, i) => (
                          <span key={i} className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg text-sm text-gray-300">
                            {f}
                            <button type="button" onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })} className="text-red-400"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 p-4 bg-dark-700/50 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} className="w-5 h-5 rounded bg-dark-600 border-dark-500 text-brand-red" />
                      <div><p className="text-sm font-medium text-white">Visible</p><p className="text-xs text-gray-500">Afficher en boutique</p></div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-5 h-5 rounded bg-dark-600 border-dark-500 text-brand-red" />
                      <div><p className="text-sm font-medium text-white">Vedette</p><p className="text-xs text-gray-500">Mettre en avant</p></div>
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                    <button type="button" onClick={closeModal} className="px-5 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl">Annuler</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-brand-red hover:bg-brand-red-light disabled:opacity-50 text-white font-medium rounded-xl">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {modalMode === "create" ? "Créer" : "Enregistrer"}
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

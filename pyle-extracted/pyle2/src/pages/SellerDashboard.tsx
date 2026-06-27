import { FormEvent, useEffect, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/cloudinary";
import { Product, Category } from "../types";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  buyer: { full_name: string | null; email: string } | null;
  order_items: { quantity: number; unit_price: number; product: { title: string } | null }[];
}

type DashTab = "overview" | "products" | "orders" | "store";

export default function SellerDashboard() {
  const { session } = useAuth();
  const [tab, setTab] = useState<DashTab>("overview");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [catId, setCatId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreDesc, setNewStoreDesc] = useState("");
  const [storeBusy, setStoreBusy] = useState(false);

  async function load() {
    if (!session?.user?.id) return;
    const { data: store } = await supabase.from("stores").select("id, name, description").eq("owner_id", session.user.id).maybeSingle();
    if (!store) { setLoading(false); return; }
    setStoreId(store.id); setStoreName(store.name); setStoreDesc(store.description ?? "");
    setNewStoreName(store.name); setNewStoreDesc(store.description ?? "");
    const [{ data: prods }, { data: categories }, { data: orderRows }] = await Promise.all([
      supabase.from("products").select("*").eq("store_id", store.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("orders").select("id, status, total_amount, created_at, buyer:profiles(full_name, email), order_items(quantity, unit_price, product:products(title))").order("created_at", { ascending: false }).limit(50),
    ]);
    const myOrders = ((orderRows ?? []) as unknown as Order[]);
    const revenue = myOrders.filter(o => o.status === "paid" || o.status === "shipped" || o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0);
    setProducts(prods ?? []); setCats(categories ?? []); setOrders(myOrders);
    setTotalRevenue(revenue); setTotalOrders(myOrders.length); setLoading(false);
  }

  useEffect(() => { load(); }, [session?.user?.id]);

  async function addProduct(e: FormEvent) {
    e.preventDefault(); if (!storeId) return;
    setBusy(true); setError(null); setSuccess(false);
    try {
      let imgUrl: string | null = null;
      if (file) imgUrl = await uploadImage(file);
      const { error } = await supabase.from("products").insert({ store_id: storeId, category_id: catId || null, title, description: desc, price: Number(price), stock_quantity: Number(stock), image_urls: imgUrl ? [imgUrl] : [], is_approved: true });
      if (error) throw error;
      setTitle(""); setDesc(""); setPrice(""); setStock(""); setCatId(""); setFile(null); setSuccess(true); load();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id); load();
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", orderId); load();
  }

  async function saveStore(e: FormEvent) {
    e.preventDefault(); if (!storeId) return; setStoreBusy(true);
    await supabase.from("stores").update({ name: newStoreName, description: newStoreDesc }).eq("id", storeId);
    setStoreName(newStoreName); setStoreDesc(newStoreDesc); setStoreBusy(false);
  }

  if (loading) return <div><Header /><div className="max-w-3xl mx-auto px-4 py-10"><div className="h-40 bg-mint rounded-2xl animate-pulse" /></div></div>;

  if (!storeId) return (
    <div><Header />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-3xl mb-3">⏳</p>
        <p className="font-semibold mb-1">Store not set up yet</p>
        <p className="text-muted text-sm mb-4">Your application was approved but your store is still being created. Please refresh.</p>
        <button onClick={() => window.location.reload()} className="bg-forest text-white font-semibold px-6 py-2.5 rounded-full text-sm">Refresh</button>
      </div>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status === "paid");

  return (
    <div><Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-xl font-bold">{storeName}</h1><p className="text-muted text-sm">{storeDesc || "No description yet"}</p></div>
          <button onClick={() => setTab("store")} className="text-xs font-medium text-muted border border-line px-3 py-1.5 rounded-full">Edit store</button>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[{ k: "overview", label: "Overview" }, { k: "products", label: `Products (${products.length})` }, { k: "orders", label: `Orders (${orders.length})${pendingOrders.length > 0 ? " 🔴" : ""}` }, { k: "store", label: "Store settings" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as DashTab)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === t.k ? "bg-forest text-white" : "bg-mint text-ink"}`}>{t.label}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="border border-line rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-forest">₦{totalRevenue.toLocaleString()}</p><p className="text-xs text-muted mt-1">Revenue</p></div>
              <div className="border border-line rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-forest">{totalOrders}</p><p className="text-xs text-muted mt-1">Orders</p></div>
              <div className="border border-line rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-forest">{products.length}</p><p className="text-xs text-muted mt-1">Products</p></div>
            </div>
            {pendingOrders.length > 0 && <div className="bg-pink-tint border border-pink/20 rounded-2xl p-4 mb-4"><p className="font-semibold text-pink-deep text-sm">🔴 {pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} waiting to be shipped</p><button onClick={() => setTab("orders")} className="text-xs text-pink-deep font-medium mt-1 underline">View orders</button></div>}
            {products.length === 0 && <div className="bg-mint rounded-2xl p-6 text-center"><p className="font-semibold mb-1">No products yet</p><p className="text-muted text-sm mb-3">Add your first product to start selling.</p><button onClick={() => setTab("products")} className="bg-pink text-white text-sm font-semibold px-5 py-2 rounded-full">Add a product</button></div>}
          </div>
        )}

        {tab === "products" && (
          <div>
            <div className="border border-line rounded-2xl p-5 mb-6">
              <h2 className="font-semibold mb-4">Add a product</h2>
              <form onSubmit={addProduct} className="flex flex-col gap-3">
                <input required placeholder="Product title" value={title} onChange={e => setTitle(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest" />
                <textarea rows={2} placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" min="0" placeholder="Price (₦)" value={price} onChange={e => setPrice(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest" />
                  <input required type="number" min="0" placeholder="Stock qty" value={stock} onChange={e => setStock(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest" />
                </div>
                <select value={catId} onChange={e => setCatId(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest text-ink">
                  <option value="">No category</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
                <label className="border border-dashed border-line rounded-xl p-4 text-center cursor-pointer hover:bg-mint transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  <p className="text-sm text-muted">{file ? file.name : "📷 Tap to add a photo"}</p>
                </label>
                {error && <p className="text-pink-deep text-sm bg-pink-tint rounded-xl px-3 py-2">{error}</p>}
                {success && <p className="text-forest text-sm bg-mint rounded-xl px-3 py-2">Product added successfully</p>}
                <button type="submit" disabled={busy} className="bg-pink text-white font-semibold py-3 rounded-full disabled:opacity-60">{busy ? "Saving…" : "Add product"}</button>
              </form>
            </div>
            {products.length === 0 ? <p className="text-muted text-sm text-center py-4">No products yet.</p> : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map(p => (
                  <div key={p.id} className="border border-line rounded-2xl overflow-hidden">
                    <div className="aspect-square bg-mint flex items-center justify-center">{p.image_urls?.[0] ? <img src={p.image_urls[0]} alt={p.title} className="w-full h-full object-cover" /> : <span className="text-2xl opacity-40">📦</span>}</div>
                    <div className="p-3"><p className="text-sm font-medium truncate">{p.title}</p><p className="text-xs text-muted">Stock: {p.stock_quantity}</p><div className="flex items-center justify-between mt-2"><p className="font-bold text-sm text-forest">₦{p.price.toLocaleString()}</p><button onClick={() => deleteProduct(p.id)} className="text-xs text-pink hover:underline">Remove</button></div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-mint rounded-2xl p-10 text-center"><p className="text-3xl mb-3">📦</p><p className="font-semibold mb-1">No orders yet</p><p className="text-muted text-sm">Orders from buyers will appear here.</p></div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map(o => (
                  <div key={o.id} className="border border-line rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div><p className="font-medium text-sm">{(o.buyer as unknown as {full_name: string|null; email: string})?.full_name || (o.buyer as unknown as {full_name: string|null; email: string})?.email}</p><p className="text-xs text-muted">{new Date(o.created_at).toLocaleDateString()}</p></div>
                      <p className="font-bold text-sm">₦{o.total_amount.toLocaleString()}</p>
                    </div>
                    {o.order_items?.length > 0 && <div className="bg-mint rounded-xl p-2 mb-3">{o.order_items.map((item, i) => <p key={i} className="text-xs text-muted">{item.product?.title} x{item.quantity} — ₦{(item.unit_price * item.quantity).toLocaleString()}</p>)}</div>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${o.status === "delivered" ? "bg-mint text-forest" : o.status === "shipped" ? "bg-blue-50 text-blue-700" : o.status === "paid" ? "bg-yellow-50 text-yellow-700" : "bg-pink-tint text-pink-deep"}`}>{o.status}</span>
                      {o.status === "paid" && <button onClick={() => updateOrderStatus(o.id, "shipped")} className="text-xs bg-forest text-white font-medium px-3 py-1 rounded-full">Mark as shipped</button>}
                      {o.status === "shipped" && <button onClick={() => updateOrderStatus(o.id, "delivered")} className="text-xs bg-mint text-forest font-medium px-3 py-1 rounded-full border border-forest">Mark as delivered</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "store" && (
          <div className="border border-line rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Store settings</h2>
            <form onSubmit={saveStore} className="flex flex-col gap-3">
              <div><label className="text-xs font-semibold text-ink mb-1 block">Store name</label><input required value={newStoreName} onChange={e => setNewStoreName(e.target.value)} className="w-full border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest" /></div>
              <div><label className="text-xs font-semibold text-ink mb-1 block">Store description</label><textarea rows={3} value={newStoreDesc} onChange={e => setNewStoreDesc(e.target.value)} className="w-full border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest resize-none" /></div>
              <button type="submit" disabled={storeBusy} className="bg-forest text-white font-semibold py-3 rounded-full disabled:opacity-60">{storeBusy ? "Saving…" : "Save changes"}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

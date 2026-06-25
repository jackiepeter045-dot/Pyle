import { FormEvent, useEffect, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/cloudinary";
import { Product, Category } from "../types";

export default function SellerDashboard() {
  const { session } = useAuth();
  const [storeId, setStoreId] = useState<string|null>(null);
  const [storeName, setStoreName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(""); const [stock, setStock] = useState("");
  const [catId, setCatId] = useState(""); const [file, setFile] = useState<File|null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);

  async function load() {
    if (!session?.user?.id) return;
    const { data: store } = await supabase.from("stores").select("id,name").eq("owner_id", session.user.id).maybeSingle();
    if (!store) { setLoading(false); return; }
    setStoreId(store.id); setStoreName(store.name);
    const [{ data: prods }, { data: categories }] = await Promise.all([
      supabase.from("products").select("*").eq("store_id", store.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name")
    ]);
    setProducts(prods ?? []); setCats(categories ?? []); setLoading(false);
  }

  useEffect(() => { load(); }, [session?.user?.id]);

  async function addProduct(e: FormEvent) {
    e.preventDefault(); if (!storeId) return;
    setBusy(true); setError(null); setSuccess(false);
    try {
      let imgUrl: string|null = null;
      if (file) imgUrl = await uploadImage(file);
      const { error } = await supabase.from("products").insert({
        store_id: storeId, category_id: catId || null, title, description: desc,
        price: Number(price), stock_quantity: Number(stock),
        image_urls: imgUrl ? [imgUrl] : [], is_approved: true
      });
      if (error) throw error;
      setTitle(""); setDesc(""); setPrice(""); setStock(""); setCatId(""); setFile(null); setSuccess(true);
      load();
    } catch(err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  }

  if (loading) return <div><Header /><div className="max-w-3xl mx-auto px-4 py-10"><div className="h-40 bg-mint rounded-2xl animate-pulse"/></div></div>;

  if (!storeId) return (
    <div><Header /><div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-3xl mb-3">⏳</p>
      <p className="font-semibold mb-1">Store not set up yet</p>
      <p className="text-muted text-sm">Your seller application may still be processing. Refresh in a moment.</p>
    </div></div>
  );

  return (
    <div><Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{storeName}</h1>
            <p className="text-muted text-sm">{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
          </div>
        </div>

        {/* Add product form */}
        <div className="border border-line rounded-2xl p-5 mb-8">
          <h2 className="font-semibold mb-4">Add a product</h2>
          <form onSubmit={addProduct} className="flex flex-col gap-3">
            <input required placeholder="Product title" value={title} onChange={e=>setTitle(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest"/>
            <textarea rows={2} placeholder="Description (optional)" value={desc} onChange={e=>setDesc(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest resize-none"/>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="0" placeholder="Price (₦)" value={price} onChange={e=>setPrice(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest"/>
              <input required type="number" min="0" placeholder="Stock qty" value={stock} onChange={e=>setStock(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest"/>
            </div>
            <select value={catId} onChange={e=>setCatId(e.target.value)} className="border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest text-ink">
              <option value="">No category</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
            <label className="border border-dashed border-line rounded-xl p-4 text-center cursor-pointer hover:bg-mint transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={e=>setFile(e.target.files?.[0]??null)}/>
              <p className="text-sm text-muted">{file ? file.name : "📷 Tap to add a photo"}</p>
            </label>
            {error && <p className="text-pink-deep text-sm bg-pink-tint rounded-xl px-3 py-2">{error}</p>}
            {success && <p className="text-forest text-sm bg-mint rounded-xl px-3 py-2">✓ Product added</p>}
            <button type="submit" disabled={busy} className="bg-pink text-white font-semibold py-3 rounded-full disabled:opacity-60">{busy?"Saving…":"Add product"}</button>
          </form>
        </div>

        {/* Product list */}
        <h2 className="font-semibold mb-4">Your products</h2>
        {products.length === 0 ? (
          <p className="text-muted text-sm">Nothing listed yet — add your first product above.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map(p => (
              <div key={p.id} className="border border-line rounded-2xl overflow-hidden">
                <div className="aspect-square bg-mint flex items-center justify-center">
                  {p.image_urls?.[0] ? <img src={p.image_urls[0]} alt={p.title} className="w-full h-full object-cover"/> : <span className="text-2xl opacity-40">📦</span>}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted">Stock: {p.stock_quantity}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-sm text-forest">₦{p.price.toLocaleString()}</p>
                    <button onClick={() => deleteProduct(p.id)} className="text-xs text-pink hover:underline">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  }

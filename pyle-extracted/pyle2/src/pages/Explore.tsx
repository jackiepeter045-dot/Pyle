import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import { Product } from "../types";

export default function Explore() {
  const [sp] = useSearchParams();
  const q = sp.get("q") || "";
  const cat = sp.get("category") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function load() {
      let query = supabase.from("products").select("*, store:stores(name)").eq("is_approved", true);
      if (q) query = query.ilike("title", `%${q}%`);
      if (cat) {
        const { data: c } = await supabase.from("categories").select("id").eq("slug", cat).maybeSingle();
        if (c) query = query.eq("category_id", c.id);
      }
      const { data } = await query.order("created_at", { ascending: false });
      setProducts((data ?? []) as unknown as Product[]);
      setLoading(false);
    }
    load();
  }, [q, cat]);

  return (
    <div>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">{q ? `Results for "${q}"` : cat ? cat.replace("-", " ") : "Explore"}</h1>
        <p className="text-muted text-sm mb-5">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(6)].map((_,i)=><div key={i} className="rounded-2xl bg-mint aspect-[3/4] animate-pulse"/>)}</div>
        ) : products.length === 0 ? (
          <div className="bg-mint rounded-2xl p-12 text-center"><p className="text-3xl mb-3">🔍</p><p className="font-semibold mb-1">Nothing found yet</p><p className="text-muted text-sm">Try a different search or check back as more sellers join Pyle.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{products.map(p=><ProductCard key={p.id} p={p}/>)}</div>
        )}
      </div>
    </div>
  );
}

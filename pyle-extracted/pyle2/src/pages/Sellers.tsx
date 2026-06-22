import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import { Store } from "../types";

export default function Sellers() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("stores").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setStores(data ?? []); setLoading(false); });
  }, []);

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">Sellers on Pyle</h1>
        <p className="text-muted text-sm mb-6">Independent sellers building their stores here.</p>
        {loading ? (
          <div className="flex flex-col gap-3">{[...Array(3)].map((_,i)=><div key={i} className="h-16 rounded-2xl bg-mint animate-pulse"/>)}</div>
        ) : stores.length === 0 ? (
          <div className="bg-mint rounded-2xl p-10 text-center"><p className="text-3xl mb-3">🏪</p><p className="font-semibold mb-1">No sellers yet</p><p className="text-muted text-sm">Pyle is just getting started — be one of the first.</p></div>
        ) : (
          <div className="flex flex-col gap-3">
            {stores.map(s => (
              <div key={s.id} className="border border-line rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-lg shrink-0">{s.logo_url ? <img src={s.logo_url} className="w-full h-full rounded-full object-cover"/> : "🏪"}</div>
                <div><p className="font-semibold text-sm">{s.name}</p>{s.description && <p className="text-muted text-xs mt-0.5 line-clamp-1">{s.description}</p>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { FormEvent, useEffect, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function BecomeSeller() {
  const { session, profile } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [desc, setDesc] = useState("");
  const [sells, setSells] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle"|"pending"|"submitted"|"rejected">("idle");
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("seller_applications").select("status").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => {
        if (data?.status === "pending") setStatus("pending");
        if (data?.status === "rejected") setStatus("rejected");
      });
  }, [session?.user?.id]);

  if (profile?.role === "seller" || profile?.role === "admin") {
    return <div><Header /><div className="max-w-lg mx-auto px-4 py-16 text-center"><p className="text-3xl mb-3">✅</p><p className="font-semibold">You're already set up to sell on Pyle.</p></div></div>;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;
    setBusy(true); setError(null);
    const { error } = await supabase.from("seller_applications").insert({
      user_id: session.user.id, store_name: storeName, store_description: desc, what_they_sell: sells, status: "pending"
    });
    setBusy(false);
    if (error) setError(error.message); else setStatus("submitted");
  }

  return (
    <div><Header />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-bold mb-1">Become a seller</h1>
        <p className="text-muted text-sm mb-7">Tell us about your store — an admin will review and approve it quickly.</p>

        {status === "submitted" || status === "pending" ? (
          <div className="bg-mint rounded-2xl p-8 text-center">
            <p className="text-3xl mb-3">⏳</p>
            <p className="font-semibold mb-1">Application submitted</p>
            <p className="text-muted text-sm">We'll review it and notify you. Usually quick.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            {status === "rejected" && <p className="text-pink-deep text-sm bg-pink-tint rounded-xl px-3 py-2">Your last application wasn't approved. You're welcome to apply again.</p>}
            <input required placeholder="Store name" value={storeName} onChange={e=>setStoreName(e.target.value)} className="border border-line rounded-2xl px-4 py-3 text-sm outline-none focus:border-forest"/>
            <textarea required rows={3} placeholder="Describe your store" value={desc} onChange={e=>setDesc(e.target.value)} className="border border-line rounded-2xl px-4 py-3 text-sm outline-none focus:border-forest resize-none"/>
            <textarea required rows={2} placeholder="What do you plan to sell?" value={sells} onChange={e=>setSells(e.target.value)} className="border border-line rounded-2xl px-4 py-3 text-sm outline-none focus:border-forest resize-none"/>
            {error && <p className="text-pink-deep text-sm bg-pink-tint rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" disabled={busy} className="bg-pink text-white font-semibold py-3 rounded-full disabled:opacity-60 mt-1">{busy?"Submitting…":"Submit application"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

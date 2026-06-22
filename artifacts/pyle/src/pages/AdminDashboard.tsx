import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import { Profile, SellerApplication } from "../types";

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [apps, setApps] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteMsg, setPromoteMsg] = useState<{ text: string; ok: boolean }|null>(null);
  const [tab, setTab] = useState<"apps"|"users">("apps");

  async function load() {
    const [{ data: u }, { data: a }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("seller_applications").select("*").eq("status", "pending").order("created_at", { ascending: true })
    ]);
    setUsers(u ?? []); setApps(a ?? []); setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function promote() {
    setPromoteMsg(null);
    const { data: t } = await supabase.from("profiles").select("id,is_owner").eq("email", promoteEmail.trim().toLowerCase()).maybeSingle();
    if (!t) { setPromoteMsg({ text: "No user found with that email. Ask them to sign up first.", ok: false }); return; }
    const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", t.id);
    if (error) setPromoteMsg({ text: error.message, ok: false });
    else { setPromoteMsg({ text: `${promoteEmail} is now an admin.`, ok: true }); setPromoteEmail(""); load(); }
  }

  async function handleApp(app: SellerApplication, approve: boolean) {
    await supabase.from("seller_applications").update({ status: approve ? "approved" : "rejected" }).eq("id", app.id);
    if (approve) {
      await supabase.from("profiles").update({ role: "seller" }).eq("id", app.user_id);
      await supabase.from("stores").insert({ owner_id: app.user_id, name: app.store_name, description: app.store_description });
    }
    load();
  }

  if (loading) return <div><Header /><div className="max-w-3xl mx-auto px-4 py-10"><div className="h-40 bg-mint rounded-2xl animate-pulse"/></div></div>;

  return (
    <div><Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Admin dashboard</h1>

        <div className="border border-line rounded-2xl p-5 mb-6">
          <h2 className="font-semibold mb-3 text-sm">Add an admin</h2>
          <div className="flex gap-2">
            <input type="email" placeholder="Registered user's email" value={promoteEmail} onChange={e=>setPromoteEmail(e.target.value)}
              className="flex-1 border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-forest"/>
            <button onClick={promote} className="bg-forest text-white font-semibold px-4 py-2.5 rounded-xl text-sm shrink-0">Promote</button>
          </div>
          {promoteMsg && <p className={`text-sm mt-2 rounded-xl px-3 py-2 ${promoteMsg.ok ? "bg-mint text-forest" : "bg-pink-tint text-pink-deep"}`}>{promoteMsg.text}</p>}
        </div>

        <div className="flex gap-2 mb-5">
          {[{ k: "apps", label: `Applications (${apps.length})` }, { k: "users", label: `Users (${users.length})` }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as "apps"|"users")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === t.k ? "bg-forest text-white" : "bg-mint text-ink"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "apps" && (
          apps.length === 0 ? (
            <p className="text-muted text-sm">No pending applications.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {apps.map(a => (
                <div key={a.id} className="border border-line rounded-2xl p-4">
                  <p className="font-semibold">{a.store_name}</p>
                  <p className="text-sm text-muted mt-1">{a.store_description}</p>
                  <p className="text-sm text-muted mt-0.5">Sells: {a.what_they_sell}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleApp(a, true)} className="bg-forest text-white text-sm font-medium px-4 py-2 rounded-full">Approve</button>
                    <button onClick={() => handleApp(a, false)} className="border border-line text-sm font-medium px-4 py-2 rounded-full">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "users" && (
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <div key={u.id} className="border border-line rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{u.full_name || u.email}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_owner && <span className="text-xs font-semibold text-forest bg-mint px-2 py-0.5 rounded-full">Owner</span>}
                  <span className="text-xs font-medium text-muted capitalize">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import { Profile } from "../types";

interface SellerApp {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string;
  what_they_sell: string;
  status: string;
  created_at: string;
  extra_info?: string;
}

interface StoreRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  owner: { full_name: string | null; email: string } | null;
  product_count: number;
}

interface OrderRow {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  buyer: { full_name: string | null; email: string } | null;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"apps" | "sellers" | "orders" | "users">("apps");
  const [users, setUsers] = useState<Profile[]>([]);
  const [apps, setApps] = useState<SellerApp[]>([]);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Add admin
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteMsg, setPromoteMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Rejection reason
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setLoading(true);
    const [
      { data: u },
      { data: a },
      { data: s },
      { data: o },
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("seller_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("stores").select("id, name, description, created_at, owner:profiles(full_name, email)").order("created_at", { ascending: false }),
      supabase.from("orders").select("id, status, total_amount, created_at, buyer:profiles(full_name, email)").order("created_at", { ascending: false }).limit(50),
    ]);

    // Get product counts per store
    const storeRows = (s ?? []) as unknown as StoreRow[];
    for (const store of storeRows) {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", store.id);
      store.product_count = count ?? 0;
    }

    setUsers(u ?? []);
    setApps(a ?? []);
    setStores(storeRows);
    setOrders((o ?? []) as unknown as OrderRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function promote() {
    setPromoteMsg(null);
    const { data: t } = await supabase.from("profiles").select("id, is_owner").eq("email", promoteEmail.trim().toLowerCase()).maybeSingle();
    if (!t) {
      setPromoteMsg({ text: "No user found with that email. Ask them to sign up first.", ok: false });
      return;
    }
    const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", t.id);
    if (error) setPromoteMsg({ text: error.message, ok: false });
    else {
      setPromoteMsg({ text: `${promoteEmail} is now an admin.`, ok: true });
      setPromoteEmail("");
      load();
    }
  }

  async function approveApp(app: SellerApp) {
    await supabase.from("seller_applications").update({ status: "approved" }).eq("id", app.id);
    await supabase.from("profiles").update({ role: "seller" }).eq("id", app.user_id);

    // Create store for the seller
    const { data: existing } = await supabase.from("stores").select("id").eq("owner_id", app.user_id).maybeSingle();
    if (!existing) {
      await supabase.from("stores").insert({
        owner_id: app.user_id,
        name: app.store_name,
        description: app.store_description,
      });
    }
    load();
  }

  async function rejectApp(appId: string, userId: string) {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    await supabase.from("seller_applications").update({
      status: "rejected",
      rejection_reason: rejectReason.trim(),
    }).eq("id", appId);
    setRejectingId(null);
    setRejectReason("");
    load();
  }

  async function suspendUser(userId: string) {
    if (!confirm("Suspend this user? They won't be able to use PYLE.")) return;
    await supabase.from("profiles").update({ role: "buyer" }).eq("id", userId);
    load();
  }

  const pendingApps = apps.filter(a => a.status === "pending");
  const allApps = apps;

  if (loading) {
    return (
      <div><Header />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="h-40 bg-mint rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div><Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-2">Admin dashboard</h1>
        <p className="text-muted text-sm mb-6">
          {users.length} users · {stores.length} sellers · {pendingApps.length} pending applications
        </p>

        {/* Add admin */}
        <div className="border border-line rounded-2xl p-4 mb-6">
          <h2 className="font-semibold text-sm mb-3">Add an admin</h2>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Registered user's email"
              value={promoteEmail}
              onChange={e => setPromoteEmail(e.target.value)}
              className="flex-1 border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-forest"
            />
            <button
              onClick={promote}
              className="bg-forest text-white font-semibold px-4 py-2.5 rounded-xl text-sm shrink-0"
            >
              Promote
            </button>
          </div>
          {promoteMsg && (
            <p className={`text-sm mt-2 rounded-xl px-3 py-2 ${promoteMsg.ok ? "bg-mint text-forest" : "bg-pink-tint text-pink-deep"}`}>
              {promoteMsg.text}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[
            { k: "apps", label: `Applications (${pendingApps.length})` },
            { k: "sellers", label: `Sellers (${stores.length})` },
            { k: "orders", label: `Orders (${orders.length})` },
            { k: "users", label: `Users (${users.length})` },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === t.k ? "bg-forest text-white" : "bg-mint text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Applications tab */}
        {tab === "apps" && (
          <div>
            {pendingApps.length === 0 ? (
              <div className="bg-mint rounded-2xl p-8 text-center">
                <p className="text-3xl mb-2">✅</p>
                <p className="font-semibold">No pending applications</p>
                <p className="text-muted text-sm mt-1">All caught up.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingApps.map(app => {
                  let extra: Record<string, string> = {};
                  try { extra = JSON.parse(app.extra_info ?? "{}"); } catch { /* ignore */ }
                  return (
                    <div key={app.id} className="border border-line rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{app.store_name}</p>
                        <span className="text-xs text-muted">{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted mb-1">{app.store_description}</p>
                      <p className="text-sm text-muted mb-1">Sells: {app.what_they_sell}</p>
                      {extra.legal_name && <p className="text-sm text-muted">Name: {extra.legal_name}</p>}
                      {extra.phone && <p className="text-sm text-muted">Phone: {extra.phone}</p>}
                      {extra.location && <p className="text-sm text-muted">Location: {extra.location}</p>}
                      {extra.experience && <p className="text-sm text-muted">Experience: {extra.experience}</p>}
                      {extra.social_link && (
                        <a href={extra.social_link} target="_blank" rel="noreferrer" className="text-sm text-pink-deep underline">
                          {extra.social_link}
                        </a>
                      )}

                      {rejectingId === app.id ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <textarea
                            rows={2}
                            placeholder="Reason for rejection (shown to applicant)"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="border border-line rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-pink"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => rejectApp(app.id, app.user_id)}
                              className="bg-pink text-white text-sm font-medium px-4 py-2 rounded-full"
                            >
                              Confirm rejection
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason(""); }}
                              className="border border-line text-sm px-4 py-2 rounded-full"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => approveApp(app)}
                            className="bg-forest text-white text-sm font-medium px-4 py-2 rounded-full"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(app.id)}
                            className="border border-line text-sm font-medium px-4 py-2 rounded-full text-pink-deep"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Show all past apps too */}
            {allApps.filter(a => a.status !== "pending").length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-sm mb-3 text-muted">Past applications</h3>
                <div className="flex flex-col gap-2">
                  {allApps.filter(a => a.status !== "pending").map(app => (
                    <div key={app.id} className="border border-line rounded-2xl px-4 py-3 flex items-center justify-between">
                      <p className="text-sm font-medium">{app.store_name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${app.status === "approved" ? "bg-mint text-forest" : "bg-pink-tint text-pink-deep"}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sellers tab */}
        {tab === "sellers" && (
          <div className="flex flex-col gap-3">
            {stores.length === 0 ? (
              <p className="text-muted text-sm">No sellers yet.</p>
            ) : stores.map(s => (
              <div key={s.id} className="border border-line rounded-2xl p-4">
                <p className="font-semibold">{s.name}</p>
                {s.description && <p className="text-sm text-muted mt-0.5 line-clamp-2">{s.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted">
                    Owner: {(s.owner as unknown as { full_name: string | null; email: string })?.full_name || (s.owner as unknown as { full_name: string | null; email: string })?.email}
                  </span>
                  <span className="text-xs text-muted">{s.product_count} products</span>
                  <span className="text-xs text-muted">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders tab */}
        {tab === "orders" && (
          <div className="flex flex-col gap-2">
            {orders.length === 0 ? (
              <div className="bg-mint rounded-2xl p-8 text-center">
                <p className="text-3xl mb-2">📦</p>
                <p className="font-semibold">No orders yet</p>
                <p className="text-muted text-sm mt-1">Orders will appear here as buyers checkout.</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className="border border-line rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {(o.buyer as unknown as { full_name: string | null; email: string })?.full_name ||
                      (o.buyer as unknown as { full_name: string | null; email: string })?.email}
                  </p>
                  <p className="text-xs text-muted">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                    o.status === "delivered" ? "bg-mint text-forest" :
                    o.status === "paid" ? "bg-blue-50 text-blue-700" :
                    o.status === "cancelled" ? "bg-pink-tint text-pink-deep" :
                    "bg-yellow-50 text-yellow-700"
                  }`}>
                    {o.status}
                  </span>
                  <p className="font-bold text-sm">₦{o.total_amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <div key={u.id} className="border border-line rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{u.full_name || u.email}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_owner && (
                    <span className="text-xs font-semibold text-forest bg-mint px-2 py-0.5 rounded-full">Owner</span>
                  )}
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
    

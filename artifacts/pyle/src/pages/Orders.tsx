import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Order { id:string; status:string; total_amount:number; created_at:string; }

export default function Orders() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("orders").select("id,status,total_amount,created_at").eq("buyer_id", session.user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [session?.user?.id]);

  const statusColor: Record<string, string> = { paid: "bg-green-100 text-green-700", shipped: "bg-blue-100 text-blue-700", delivered: "bg-mint text-forest", cancelled: "bg-red-100 text-red-600", pending: "bg-yellow-50 text-yellow-700" };

  return (
    <div><Header />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-bold mb-6">Orders</h1>
        {loading ? <div className="h-32 bg-mint rounded-2xl animate-pulse"/> :
          orders.length === 0 ? (
            <div className="bg-mint rounded-2xl p-10 text-center"><p className="text-3xl mb-3">📦</p><p className="font-semibold mb-1">No orders yet</p><p className="text-muted text-sm">Anything you buy on Pyle will appear here.</p></div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map(o => (
                <div key={o.id} className="border border-line rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[o.status]||"bg-mint text-muted"}`}>{o.status}</span>
                    <p className="text-muted text-xs mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-sm">₦{o.total_amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

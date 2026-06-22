import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { profile } = useAuth();
  if (!profile) return null;
  const roleLabel: Record<string, string> = { buyer: "Buyer", seller: "Seller", admin: "Admin" };

  return (
    <div><Header />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-bold mb-6">My account</h1>
        <div className="flex items-center gap-4 mb-6 p-4 bg-mint rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-pink text-white flex items-center justify-center font-bold text-lg">{(profile.full_name||profile.email)[0].toUpperCase()}</div>
          <div><p className="font-semibold">{profile.full_name||"Pyle user"}</p><p className="text-sm text-muted">{profile.email}</p><span className="text-xs font-medium text-forest bg-mint border border-line px-2 py-0.5 rounded-full mt-1 inline-block">{roleLabel[profile.role]}</span></div>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { to: "/account/orders", label: "Orders", icon: "📦" },
          ].concat(
            profile.role === "buyer" ? [{ to: "/account/become-seller", label: "Become a seller", icon: "🏪" }] : [],
            profile.role === "seller" ? [{ to: "/seller", label: "Seller dashboard", icon: "📊" }] : [],
            profile.role === "admin" ? [
              { to: "/seller", label: "Seller dashboard", icon: "📊" },
              { to: "/admin", label: "Admin dashboard", icon: "⚙️" },
            ] : []
          ).map(item => (
            <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-3.5 border border-line rounded-2xl font-medium text-sm hover:bg-mint transition-colors">
              <span>{item.icon}</span><span className="flex-1">{item.label}</span><span className="text-muted">›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function close() { setOpen(false); }

  async function handleSignOut() {
    await signOut();
    close();
    navigate("/");
  }

  const initial = profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "?";

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="font-bold text-[22px] tracking-tight shrink-0">
            <span className="text-pink">PY</span><span className="text-forest">LE</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-mint rounded-full px-4 py-2.5 text-sm text-muted">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
            <span>Search products…</span>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/account" className="w-8 h-8 rounded-full bg-pink text-white flex items-center justify-center text-sm font-semibold">{initial}</Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-ink px-3 py-1.5 rounded-full border border-line">Sign in</Link>
                <Link to="/signup" className="text-sm font-semibold text-white bg-forest px-4 py-1.5 rounded-full">Sign up</Link>
              </div>
            )}

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex flex-col gap-[5px] p-2 rounded-lg hover:bg-mint transition-colors"
            >
              <span className="block w-5 h-[2px] bg-ink rounded" />
              <span className="block w-5 h-[2px] bg-ink rounded" />
              <span className="block w-5 h-[2px] bg-ink rounded" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-line bg-white">
            <span className="font-bold text-[22px]">
              <span className="text-pink">PY</span><span className="text-forest">LE</span>
            </span>
            <button
              onClick={close}
              aria-label="Close menu"
              className="w-9 h-9 rounded-full bg-mint flex items-center justify-center text-lg font-medium text-ink"
            >
              ✕
            </button>
          </div>

          <nav className="px-5 py-6 flex flex-col gap-1 bg-white">
            {[
              { to: "/", label: "Home" },
              { to: "/explore", label: "Explore" },
              { to: "/sellers", label: "Sellers" },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={close}
                className={`px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${location.pathname === l.to ? "bg-mint text-forest" : "text-ink hover:bg-mint"}`}
              >
                {l.label}
              </Link>
            ))}

            <div className="h-px bg-line my-3" />

            {session && profile ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-pink text-white flex items-center justify-center font-semibold text-sm">{initial}</div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{profile.full_name || "Pyle user"}</p>
                    <p className="text-muted text-xs">{profile.email}</p>
                  </div>
                </div>

                <Link to="/account" onClick={close} className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-mint">My account</Link>
                <Link to="/account/orders" onClick={close} className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-mint">Orders</Link>

                {profile.role === "buyer" && (
                  <Link to="/account/become-seller" onClick={close} className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-mint">Become a seller</Link>
                )}
                {profile.role === "seller" && (
                  <Link to="/seller" onClick={close} className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-mint">Seller dashboard</Link>
                )}
                {profile.role === "admin" && (
                  <>
                    <Link to="/seller" onClick={close} className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-mint">Seller dashboard</Link>
                    <Link to="/admin" onClick={close} className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-mint">Admin dashboard</Link>
                  </>
                )}

                <div className="h-px bg-line my-1" />
                <button onClick={handleSignOut} className="px-3 py-3 rounded-xl text-[15px] font-medium text-pink text-left hover:bg-pink-tint">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={close} className="px-3 py-3 rounded-xl text-[15px] font-medium text-ink hover:bg-mint">Sign in</Link>
                <Link to="/signup" onClick={close} className="px-4 py-3 rounded-xl text-[15px] font-semibold text-white bg-forest text-center mt-1">Create account</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

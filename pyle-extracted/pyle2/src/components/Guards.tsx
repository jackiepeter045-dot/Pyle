import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export function Protected({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted text-sm">Loading…</span></div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AdminOnly({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function SellerOnly({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (profile?.role !== "seller" && profile?.role !== "admin") return <Navigate to="/account/become-seller" replace />;
  return <>{children}</>;
}

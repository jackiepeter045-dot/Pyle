import { Link } from "react-router-dom";
import { Product } from "../types";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/product/${p.id}`} className="group block border border-line rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      <div className="aspect-square bg-mint flex items-center justify-center overflow-hidden">
        {p.image_urls?.[0] ? (
          <img src={p.image_urls[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-4xl opacity-40">📦</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-ink truncate">{p.title}</p>
        {p.store && <p className="text-xs text-muted mt-0.5 truncate">{p.store.name}</p>}
        <p className="font-bold text-forest mt-1.5 text-sm">{p.currency} {p.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}

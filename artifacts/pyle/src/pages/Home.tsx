import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Marquee from "../components/Marquee";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";

const FALLBACK_CATS = [
  { id: "1", name: "Fashion", slug: "fashion", emoji: "👗" },
  { id: "2", name: "Electronics", slug: "electronics", emoji: "📱" },
  { id: "3", name: "Home & Living", slug: "home-living", emoji: "🏡" },
  { id: "4", name: "Beauty", slug: "beauty", emoji: "✨" },
  { id: "5", name: "Sports", slug: "sports", emoji: "⚽" },
  { id: "6", name: "Books", slug: "books", emoji: "📚" },
  { id: "7", name: "Gaming", slug: "gaming", emoji: "🎮" },
  { id: "8", name: "Digital", slug: "digital", emoji: "💾" },
];

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("products").select("*, store:stores(name)").eq("is_approved", true).order("created_at", { ascending: false }).limit(8)
    ]).then(([{ data: cats }, { data: prods }]) => {
      if (cats?.length) setCategories(cats);
      setProducts((prods ?? []) as unknown as Product[]);
      setFetching(false);
    });
  }, []);

  const cats = categories.length ? categories : FALLBACK_CATS;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Header />

      <section className="bg-forest text-white px-5 pt-10 pb-12">
        <p className="text-pink text-xs font-semibold uppercase tracking-widest mb-3">Early access · Nigeria's marketplace</p>
        <h1 className="text-3xl font-bold leading-tight mb-2">
          Discover products<br />
          <span className="text-pink">you'll love.</span>
        </h1>
        <p className="text-white/70 text-sm mb-6 leading-relaxed max-w-xs">
          Shop from independent sellers across Nigeria — fashion, electronics, beauty and more.
        </p>

        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full px-4 py-3 gap-3 shadow-lg">
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="flex-1 text-sm text-ink outline-none placeholder-muted bg-transparent"
          />
          {search && (
            <button type="submit" className="text-xs font-semibold text-white bg-pink px-3 py-1.5 rounded-full shrink-0">Go</button>
          )}
        </form>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {cats.map(c => (
            <Link
              key={c.slug}
              to={`/explore?category=${c.slug}`}
              className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors border border-white/15"
            >
              <span>{c.emoji}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <Marquee />

      <section className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-3">
        {[
          { icon: "🔒", title: "Secure checkout", sub: "Powered by Flutterwave & Paystack" },
          { icon: "📦", title: "Track orders", sub: "From payment to delivery" },
          { icon: "⚡", title: "Fast to buy", sub: "Checkout in seconds" },
        ].map(t => (
          <div key={t.title} className="flex flex-col items-center text-center gap-1 p-3 rounded-2xl border border-line">
            <span className="text-xl">{t.icon}</span>
            <p className="font-semibold text-xs text-ink leading-tight">{t.title}</p>
            <p className="text-[10px] text-muted leading-tight hidden sm:block">{t.sub}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink">Live on Pyle</h2>
          <Link to="/explore" className="text-xs font-semibold text-pink">View all →</Link>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-mint aspect-[3/4] animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-mint rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">🛍</p>
            <h3 className="font-bold text-base mb-1">Products landing soon</h3>
            <p className="text-muted text-sm mb-5 max-w-xs mx-auto">Sellers are setting up their stores. Check back shortly — or be the first to list.</p>
            <Link to="/account/become-seller" className="inline-block bg-pink text-white text-sm font-semibold px-6 py-2.5 rounded-full">
              Start selling on Pyle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <footer className="border-t border-line py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span className="font-bold text-lg"><span className="text-pink">PY</span><span className="text-forest">LE</span></span>
          <div className="flex gap-5 text-xs text-muted">
            <Link to="/sellers">Sellers</Link>
            <Link to="/explore">Shop</Link>
          </div>
          <p className="text-[11px] text-muted w-full sm:w-auto">© 2026 Pyle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

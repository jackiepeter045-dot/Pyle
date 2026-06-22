import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-bold text-line mb-4">404</p>
      <p className="font-semibold text-lg mb-1">Page not found</p>
      <p className="text-muted text-sm mb-7">This page doesn't exist or has been moved.</p>
      <Link to="/" className="bg-ink text-white font-semibold px-6 py-3 rounded-full text-sm">Go home</Link>
    </div>
  );
}

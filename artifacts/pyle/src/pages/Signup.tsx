import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signUp, signInGoogle } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string|null>(null); const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    const err = await signUp(email, password, name);
    console.log(err);
    setBusy(false);
    if (err) setError(typeof err === "string" ? err : JSON.stringify(err)); else nav("/");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center max-w-sm mx-auto px-5 py-12">
      <Link to="/" className="font-bold text-2xl mb-8 block"><span className="text-pink">PY</span><span className="text-forest">LE</span></Link>
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-muted text-sm mb-7">Join Pyle to start shopping or selling.</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="text" required placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} className="border border-line rounded-2xl px-4 py-3 text-sm outline-none focus:border-forest"/>
        <input type="email" required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="border border-line rounded-2xl px-4 py-3 text-sm outline-none focus:border-forest"/>
        <input type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)} className="border border-line rounded-2xl px-4 py-3 text-sm outline-none focus:border-forest"/>
        {error && <p className="text-pink-deep text-sm bg-pink-tint rounded-xl px-3 py-2">{error}</p>}
        <button type="submit" disabled={busy} className="bg-forest text-white font-semibold py-3 rounded-full disabled:opacity-60 mt-1">{busy?"Creating account…":"Create account"}</button>
      </form>
      <div className="flex items-center gap-3 my-5"><div className="h-px bg-line flex-1"/><span className="text-muted text-xs">or</span><div className="h-px bg-line flex-1"/></div>
      <button onClick={signInGoogle} className="w-full border border-line rounded-full py-3 font-medium text-sm hover:bg-mint transition-colors">Continue with Google</button>
      <p className="text-sm text-muted mt-7 text-center">Already have an account? <Link to="/login" className="text-pink-deep font-semibold">Sign in</Link></p>
    </div>
  );
}

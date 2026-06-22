import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
console.log("SUPABASE URL:", url, "KEY starts with:", key?.slice(0, 20));

const isValidUrl = url && (url.startsWith("https://") || url.startsWith("http://"));

if (!isValidUrl || !key) {
  console.error(
    "⚠️  Missing or invalid Supabase env vars.\n" +
    "  VITE_SUPABASE_URL must be an https:// URL (e.g. https://xxxx.supabase.co)\n" +
    "  VITE_SUPABASE_ANON_KEY must be the anon/public JWT key.\n" +
    "  Current VITE_SUPABASE_URL starts with:", url?.slice(0, 30)
  );
}

export const supabase = isValidUrl && key
  ? createClient(url, key)
  : createClient("https://placeholder.supabase.co", "placeholder-key");

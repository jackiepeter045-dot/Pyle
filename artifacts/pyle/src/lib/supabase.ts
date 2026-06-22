import { createClient } from "@supabase/supabase-js";

let url = import.meta.env.VITE_SUPABASE_URL as string;
let key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Auto-correct if the two values were entered in swapped fields
if (url && key && url.startsWith("eyJ") && key.startsWith("https://")) {
  console.warn("SUPABASE: URL and ANON_KEY appear swapped — auto-correcting.");
  [url, key] = [key, url];
}

console.log("SUPABASE URL:", url?.slice(0, 40), "KEY starts with:", key?.slice(0, 20));

export const supabase = createClient(url, key);

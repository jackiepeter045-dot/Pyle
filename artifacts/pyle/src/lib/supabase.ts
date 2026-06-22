import { createClient } from "@supabase/supabase-js";

let url = import.meta.env.VITE_SUPABASE_URL as string;
let key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// The two secrets are entered in swapped fields — auto-correct silently
if (url?.startsWith("eyJ") && key?.startsWith("https://")) {
  [url, key] = [key, url];
}

export const supabase = createClient(url, key);

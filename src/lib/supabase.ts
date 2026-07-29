import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const adminUserId =
  import.meta.env.VITE_SUPABASE_ADMIN_USER_ID?.trim() ?? "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey && adminUserId,
);

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null;

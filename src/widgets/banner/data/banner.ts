import { supabase } from "@/lib/supabase";

interface BannerSettingsRow {
  url: string | null;
}

export async function getBannerUrl(): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("banner_settings")
    .select("url")
    .eq("id", "main")
    .single();

  if (error) {
    throw error;
  }

  return (data as BannerSettingsRow).url;
}

export async function updateBannerUrl(url: string): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("banner_settings")
    .update({
      url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "main")
    .select("url")
    .single();

  if (error) {
    throw error;
  }

  return (data as BannerSettingsRow).url ?? "";
}

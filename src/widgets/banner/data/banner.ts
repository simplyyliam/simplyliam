import { supabase } from "@/lib/supabase";

export type BannerSourceType = "embed" | "image" | "video";

export interface BannerSettings {
  url: string;
  sourceType: BannerSourceType;
  assetPath: string | null;
}

interface BannerSettingsRow {
  url: string | null;
  source_type: BannerSourceType;
  asset_path: string | null;
}

interface BannerSettingsInput {
  url: string;
  sourceType: BannerSourceType;
  assetPath: string | null;
}

const bannerBucket = "banner-media";
const bannerColumns = "url, source_type, asset_path";

function mapBannerSettings(
  row: BannerSettingsRow,
): BannerSettings {
  return {
    url: row.url ?? "",
    sourceType: row.source_type,
    assetPath: row.asset_path,
  };
}

export async function getBannerSettings(): Promise<BannerSettings> {
  if (!supabase) {
    return {
      url: "",
      sourceType: "embed",
      assetPath: null,
    };
  }

  const { data, error } = await supabase
    .from("banner_settings")
    .select(bannerColumns)
    .eq("id", "main")
    .single();

  if (error) {
    throw error;
  }

  return mapBannerSettings(data as BannerSettingsRow);
}

export async function updateBannerSettings(
  settings: BannerSettingsInput,
): Promise<BannerSettings> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("banner_settings")
    .update({
      url: settings.url,
      source_type: settings.sourceType,
      asset_path: settings.assetPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "main")
    .select(bannerColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapBannerSettings(data as BannerSettingsRow);
}

export async function uploadBannerMedia(
  file: File,
  userId: string,
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const fileTypes: Record<
    string,
    {
      extension: string;
      sourceType: Exclude<BannerSourceType, "embed">;
    }
  > = {
    "image/gif": { extension: "gif", sourceType: "image" },
    "image/jpeg": { extension: "jpg", sourceType: "image" },
    "image/png": { extension: "png", sourceType: "image" },
    "image/webp": { extension: "webp", sourceType: "image" },
    "video/mp4": { extension: "mp4", sourceType: "video" },
    "video/webm": { extension: "webm", sourceType: "video" },
  };
  const mediaType = fileTypes[file.type];

  if (!mediaType) {
    throw new Error("Unsupported banner file type.");
  }

  const path =
    `${userId}/${crypto.randomUUID()}.${mediaType.extension}`;
  const { error } = await supabase.storage
    .from(bannerBucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(bannerBucket)
    .getPublicUrl(path);

  return {
    path,
    sourceType: mediaType.sourceType,
    url: data.publicUrl,
  };
}

export async function removeBannerMedia(path: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.storage
    .from(bannerBucket)
    .remove([path]);

  if (error) {
    throw error;
  }
}

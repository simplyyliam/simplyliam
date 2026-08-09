import { supabase } from "@/lib/supabase";
import type {
  PortfolioProject,
  ProjectInput,
} from "../types/project";

const avatarBucket = "project-avatars";
const projectColumns =
  "id, name, description, link, year, show_avatar, avatar_url, avatar_path, created_at";

export async function getProjects(): Promise<PortfolioProject[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select(projectColumns)
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as PortfolioProject[];
}

export async function createProject(
  project: ProjectInput,
): Promise<PortfolioProject> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select(projectColumns)
    .single();

  if (error) {
    throw error;
  }

  return data as PortfolioProject;
}

export async function updateProject(
  id: string,
  project: ProjectInput,
): Promise<PortfolioProject> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("projects")
    .update(project)
    .eq("id", id)
    .select(projectColumns)
    .single();

  if (error) {
    throw error;
  }

  return data as PortfolioProject;
}

export async function uploadProjectAvatar(
  file: File,
  userId: string,
) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const extensionByType: Record<string, string> = {
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[file.type];

  if (!extension) {
    throw new Error("Unsupported avatar image type.");
  }

  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(avatarBucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(avatarBucket)
    .getPublicUrl(path);

  return {
    path,
    url: data.publicUrl,
  };
}

export async function removeProjectAvatar(path: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.storage
    .from(avatarBucket)
    .remove([path]);

  if (error) {
    throw error;
  }
}

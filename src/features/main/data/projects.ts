import { supabase } from "@/lib/supabase";
import type {
  NewPortfolioProject,
  PortfolioProject,
} from "../types/project";

const projectColumns = "id, name, description, link, year, created_at";

export async function getProjects(): Promise<PortfolioProject[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select(projectColumns)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as PortfolioProject[];
}

export async function createProject(
  project: NewPortfolioProject,
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

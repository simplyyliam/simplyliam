export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  link: string;
  year: number;
  avatar_url: string | null;
  avatar_path: string | null;
  created_at: string;
}

export type ProjectInput = Pick<
  PortfolioProject,
  "name" | "description" | "link" | "avatar_url" | "avatar_path"
>;

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  link: string;
  year: number;
  created_at: string;
}

export type NewPortfolioProject = Pick<
  PortfolioProject,
  "name" | "description" | "link"
>;

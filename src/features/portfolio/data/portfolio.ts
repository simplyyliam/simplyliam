export type WorkItem = {
  name: string;
  href?: string;
  thumbnail?: string;
};

export type Portfolio = {
  name: string;
  avatar?: string;
  work: WorkItem[];
};

export const portfolio: Portfolio = {
  name: "Liam Matthews",
  avatar: undefined,
  work: [
    { name: "Chromadance" },
    { name: "Dotsy" },
    { name: "Souna" },
  ],
};

import type { PortfolioDocument } from "../types/portfolio";

export const defaultPortfolioDocument: PortfolioDocument = {
  schemaVersion: 2,
  blocks: [
    {
      id: "about",
      type: "about",
      visible: true,
      content: {
        introduction: "Hey, I'm liam! I'm a",
        roles: ["Developer", "Designer"],
        biography: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "I’m a curious person who enjoys bringing little ideas to life. I’m happiest when I’m learning, making things, and slowly turning something that once lived in my head into something real.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "banner",
      type: "banner",
      visible: true,
      content: {
        label: "Banner",
      },
    },
    {
      id: "projects",
      type: "projects",
      visible: true,
      content: {
        heading: "Projects",
        emptyMessage: "No projects yet, come back later :)",
      },
    },
  ],
  layouts: {
    lg: [
      { i: "about", x: 0, y: 0, w: 12, h: 180, minW: 4, minH: 1 },
      { i: "banner", x: 0, y: 180, w: 12, h: 360, minW: 4, minH: 240 },
      { i: "projects", x: 0, y: 540, w: 12, h: 180, minW: 6, minH: 1 },
    ],
    md: [
      { i: "about", x: 0, y: 0, w: 6, h: 180, minW: 3, minH: 1 },
      { i: "banner", x: 0, y: 180, w: 6, h: 360, minW: 3, minH: 240 },
      { i: "projects", x: 0, y: 540, w: 6, h: 180, minW: 3, minH: 1 },
    ],
    sm: [
      { i: "about", x: 0, y: 0, w: 1, h: 240, minW: 1, minH: 1 },
      { i: "banner", x: 0, y: 240, w: 1, h: 300, minW: 1, minH: 240 },
      { i: "projects", x: 0, y: 540, w: 1, h: 180, minW: 1, minH: 1 },
    ],
  },
};

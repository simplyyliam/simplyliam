# Agent Worklog

## 2026-07-29 — Default standalone route

- Product goal: show `pages/standalone/main/page.tsx` at the browser root.
- Routing decision: register the standalone `main` page as the `/` index and retain its `/main` route.
- Layout decision: make `StandaloneLayout` own the root route; keep `AppLayout` pathless for any generated app pages.
- Controls, canvas output, persistence, settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run the project lint and production build commands.

## 2026-07-29 — Responsive standalone main page

- Product goal: keep the main panel comfortably inset and fully visible from mobile through wide desktop viewports.
- Layout decision: replace the fixed horizontal padding with breakpoint-based horizontal padding and use dynamic viewport sizing, with no vertical inset.
- Controls, persistence, settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run lint and a production build, then inspect the root route at mobile and desktop viewport sizes.

## 2026-07-29 — Constrained 4K layout

- Product goal: make the content panel narrower on maximized 4K displays without excessive or fragile fixed padding.
- Layout decision: center the panel, cap it at `1056px` based on the 4K browser comparison, and apply horizontal gutters plus `10px` vertical padding from the `sm` breakpoint upward; mobile remains edge-to-edge.
- Surface decision: preserve the Figma-derived `#ECECEC` fill and the user's current placeholder content.
- Controls, persistence, settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run lint and a production build.

## 2026-07-29 — Mobile portfolio responsiveness

- Product goal: make the complete portfolio readable, scrollable, and comfortably spaced on phone viewports without changing the established desktop content width.
- Root-cause findings: the standalone layout clipped overflow at one screen height; the banner and page gaps stayed desktop-sized on mobile; project text lacked a shrinkable column and mobile-specific composition.
- Layout decision: allow document scrolling, scale banner height and section gaps by breakpoint, keep the banner edge-to-edge on mobile, and give text sections their own mobile gutters.
- Component decision: keep the intro compact, stack project name and description on mobile without the dotted description underline, restore the inline underlined layout on larger screens, and keep the year visible without squeezing the description.
- Typography decision: repair the malformed DM Sans theme declaration, use DM Sans as the global Tailwind sans token, and keep readable mobile line heights.
- Controls, persistence, settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run lint and production build, then inspect phone and desktop viewports in a real browser.

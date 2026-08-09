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

## 2026-07-29 — Developer project publishing

- Product goal: let the portfolio owner add projects from the browser while visitors can only view them.
- Data model: Supabase `projects` rows contain `id`, `name`, `description`, `link`, `year`, and `created_at`.
- Security decision: public/anonymous users receive read-only access; inserts require an authenticated Supabase user whose ID matches the single configured admin UUID in both RLS and the frontend visibility check.
- Authentication decision: expose password sign-in at `/admin`; do not expose sign-up in the app; persist the Supabase session in the browser.
- UI decision: authenticated admin sessions see a plus button beside the Projects heading. The existing shadcn Dialog contains accessible name, description, and URL fields.
- State flow: the project list is sourced entirely from Supabase and appends a successful insert without a page reload.
- Project navigation: each project receives a link prop and renders as an external anchor.
- Controls: add-project trigger and dialog form. Persistence: Supabase. Settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run lint and production build; verify the public fallback state and configured admin UI behavior in a browser.

## 2026-07-29 — Project avatars and browser editing

- Product goal: let the portfolio owner upload a project avatar and edit an existing project from the browser.
- Data model: add nullable `avatar_url` and `avatar_path` fields to `projects`; store image files in a public `project-avatars` bucket limited to common image formats and 2 MB.
- Security decision: retain public project/image reads while restricting project updates and Storage metadata/upload/delete operations to the configured admin UUID through RLS.
- Dialog decision: replace the add-only component with one reusable add/edit dialog. Both modes edit name, description, link, and an optional avatar image.
- File lifecycle: upload a uniquely named file under the admin UUID, roll it back if the database write fails, and delete the previous avatar after a successful replacement.
- Project-row decision: keep the project link and edit button as separate interactive elements. Show the edit control persistently on touch layouts and animate it beside the year on desktop hover.
- Motion decision: reveal the desktop edit control from `scale: 0.25`, `opacity: 0`, and `blur(4px)` using a 0.3-second zero-bounce spring.
- Controls: avatar file input and edit trigger. Persistence: Supabase Database and Storage. Settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run lint/build, apply the migration, then verify add, edit, upload, public image display, and admin-only control visibility.

## 2026-07-29 — Mobile portfolio responsiveness

- Product goal: make the complete portfolio readable, scrollable, and comfortably spaced on phone viewports without changing the established desktop content width.
- Root-cause findings: the standalone layout clipped overflow at one screen height; the banner and page gaps stayed desktop-sized on mobile; project text lacked a shrinkable column and mobile-specific composition.
- Layout decision: allow document scrolling, scale banner height and section gaps by breakpoint, keep the banner edge-to-edge on mobile, and give text sections their own mobile gutters.
- Component decision: keep the intro compact, stack project name and description on mobile without the dotted description underline, restore the inline underlined layout on larger screens, and keep the year visible without squeezing the description.
- Typography decision: repair the malformed DM Sans theme declaration, use DM Sans as the global Tailwind sans token, and keep readable mobile line heights.
- Controls, persistence, settings transfer, timeline, layers, and export behavior are unaffected.
- Verification: run lint and production build, then inspect phone and desktop viewports in a real browser.

## 2026-08-09 — Portfolio visual editor foundation

- Product goal: let the portfolio owner change content, visibility, section order, and responsive layout without editing source files.
- Document decision: represent the page as versioned JSON containing registered blocks and separate `lg`, `md`, and `sm` grid layouts.
- Block scope: seed About, Banner, and Projects. Keep project records and banner media in their existing specialized Supabase tables.
- Responsive decision: use a 12-column desktop grid, 6-column tablet grid, and single-column mobile layout. Mobile prioritizes ordering over freeform placement.
- Publishing decision: keep one owner-only draft and one publicly readable published document so unfinished edits never leak to visitors.
- Security decision: enable RLS, allow public reads only for the published version, and restrict draft reads and all writes to the configured portfolio owner.
- Renderer output, editor controls, inline rich text, drag behavior, history, and publishing actions will be added in later milestones.
- Verification: run lint, TypeScript production build, and migration syntax review; apply the migration before connecting the public renderer.

## 2026-08-09 — Data-driven portfolio renderer

- Product goal: render the existing public portfolio from the published Supabase document without changing its established appearance.
- Security verification: anonymous requests can read the published `main` document and receive zero draft rows.
- Registry decision: map the About, Banner, and Projects block types to their existing production components through one typed registry.
- Content decision: pass introductions, rotating roles, biography text, banner fallback label, project heading, and empty-state copy from block content instead of hardcoding them in the components.
- Resilience decision: render the seeded local document immediately, validate remote JSON at runtime, and retain the local document if loading or validation fails.
- Layout decision: preserve the current responsive flex layout for this milestone; saved grid coordinates become active with the drag-and-resize editor milestone.
- Verification: run lint and the production build, then inspect the Supabase-backed page at desktop and narrow viewport sizes in a real browser.

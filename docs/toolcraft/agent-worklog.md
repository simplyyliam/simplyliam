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

## 2026-08-09 — Admin layout editing and publishing

- Product goal: let the authenticated portfolio owner rearrange and resize sections directly on the page, then deliberately publish or discard the result.
- Control inventory — access: the owner-only floating toolbar switches between preview and edit modes.
- Control inventory — layout: each visible block gains a dedicated drag handle in edit mode; desktop and tablet blocks can be resized, while the one-column mobile layout supports ordering without horizontal resizing.
- Control inventory — publishing: Publish writes the working document to both draft and published records; Discard restores the published document and synchronizes the draft record.
- Responsive decision: activate saved 12-column, 6-column, and 1-column layouts using container-width breakpoints so the editor responds to the portfolio canvas rather than the full browser width.
- Persistence decision: keep drag updates local until an explicit action. Revision-checked Supabase updates prevent silently overwriting a document changed in another browser session.
- Feedback decision: disable destructive or repeated actions while saving and surface Supabase or revision errors beside the editor controls.
- Layers, timeline, settings transfer, and export behavior remain unnecessary for this milestone. Inline rich-text controls remain a later milestone.
- Verification: run lint and the production build, then verify public read-only rendering plus authenticated drag, resize, discard, and publish behavior in a real browser.

## 2026-08-09 — Inline portfolio content editing

- Product goal: edit portfolio copy in context without opening source files or a separate content-management screen.
- Control inventory — short copy: introduction, rotating roles, project heading, empty-project message, and banner fallback label use lightweight content-editable fields.
- Control inventory — biography: the biography uses a compact Tiptap editor with selection-based bold and italic controls and stores its output in the existing rich-text JSON document.
- Control inventory — sections: a checkbox menu in the editor toolbar controls block visibility while preventing the final visible section from being hidden.
- Rendering decision: public rich-text JSON is rendered by a small local renderer; the Tiptap editing bundle is lazy-loaded only after the owner enters edit mode.
- State decision: all inline and visibility updates feed the same working portfolio document as grid changes, so Publish and Discard apply consistently to the entire edit session.
- Verification: run lint and the production build, verify the editor bundle is code-split, then manually test selection formatting, visibility restoration, publishing, and mobile toolbar wrapping.

## 2026-08-09 — Selection-first rich-text toolbar

- Product goal: make inline editing feel closer to Notion, with clearly highlighted editable copy and a compact contextual toolbar above selected text.
- Surface decision: all editable text receives a muted gray background; the active browser selection uses a stronger neutral highlight and preserves readable foreground contrast.
- Toolbar decision: use an opaque foreground-colored surface with a 12 px outer radius, 4 px padding, and 8 px child-control radii so nested corners remain concentric.
- Formatting controls: support paragraph and heading levels, text colors, bold, italic, underline, links, bulleted lists, and numbered lists.
- Persistence decision: store formatting as Tiptap JSON marks and nodes; safely render supported links and whitelisted colors for public visitors.
- Responsive decision: constrain the toolbar to the viewport with horizontal overflow for narrow selections, and measure the grid container before its first render to avoid a desktop-width flash.
- Verification: run lint and the production build, inspect public desktop and narrow layouts in a real browser, then verify authenticated selection positioning and formatting interactions manually.

## 2026-08-09 — Inline editor spacing and stacking polish

- Product goal: remove awkward wrapping and make edit-mode surfaces feel intentional without changing the published portfolio layout.
- Typography decision: keep short plain-text fields on one line; the introduction and rotating-role controls remain a single non-wrapping row.
- Highlight decision: apply the biography’s muted background to cloned inline fragments so each wrapped line receives its own fitted highlight instead of one full-width rectangle.
- Section decision: add a 10 px inset inside editable grid items while leaving public section spacing unchanged.
- Layering decision: portal the selection toolbar to the document body with fixed positioning and a layer above avatars and grid controls but below modal and dropdown overlays.
- Scope decision: keep the introduction as a plain-text field without rich formatting controls; the contextual toolbar remains attached to biography rich text where formatting can be persisted correctly.
- Verification: run lint and the production build, then verify non-wrapping intro copy, line-level highlights, section insets, and toolbar layering in authenticated edit mode.

## 2026-08-09 — Tiptap editor lifecycle guard

- Root cause: React Strict Mode temporarily destroys and recreates the Tiptap editor during development, while the content synchronization effect could still hold the destroyed instance.
- Fix: skip content synchronization, toolbar-state reads, rendering, and Bubble Menu visibility checks whenever Tiptap reports that the editor has been destroyed.
- Verification: lint and the production build pass; edit mode should be manually reopened after a hard refresh to confirm the authenticated browser flow.

## 2026-08-09 — Inline editing visual cleanup

- Overflow decision: preserve scrolling inside constrained editable grid sections while hiding native scrollbar chrome in Firefox and WebKit-based browsers.
- Focus decision: remove the inline editors' focus rings; the caret, editable highlight, and text selection continue to communicate editing state without adding another border.
- Spacing decision: increase the intro-to-role gap only in edit mode to offset the editable fields' negative margins and restore a natural sentence space. Published spacing remains unchanged.
- Verification: lint and the production build pass.

## 2026-08-09 — Content-hugging portfolio sections

- Product goal: remove fixed-height whitespace from About and Projects in both edit and preview modes, while letting those sections grow as their content changes.
- Renderer decision: measure intrinsic section content with `ResizeObserver`, convert it to responsive grid rows for collision and compaction, and apply the exact measured pixel height to the visible section surface.
- Control inventory: About and Projects are content-sized and no longer manually resizable; Banner keeps its fixed, user-resizable media height. All sections remain draggable in edit mode.
- Responsive decision: store measurements independently for each active breakpoint so text wrapping and mobile project rows produce the correct height at their own widths.
- Persistence decision: grid row measurements flow through the existing draft layout updates in edit mode; preview mode derives the same content height without mutating the published document.
- Verification: production build, lint, and diff checks pass. Authenticated drag and resize behavior requires a final refresh in the existing signed-in browser session.

## 2026-08-09 — Edge-to-edge banner editing surface

- Surface decision: remove the edit-mode content inset from Banner only, allowing visual media to fill the draggable section boundary while retaining its rounded clipping and section outline.
- Scope decision: About and Projects keep their 10 px editing inset for text readability.
- Verification: run lint, production build, and diff checks.

## 2026-08-09 — Stable bento drop targets

- Root cause: changing the live grid item width during every drag frame made pointer geometry, collision handling, and the fitted placeholder compete, producing offset cards and intermittent slot filling.
- Drag decision: keep the moving section at its canonical size and let it track the pointer freely while rendering a separate fitted drop target from the drag-start layout snapshot.
- Auto-fit decision: calculate the full available horizontal interval at the pointer's vertical position; dropping below all sections consistently previews and commits a full-row section.
- Stability decision: do not mutate grid internals during drag. Neighboring sections remain frozen, and release commits the exact fitted target before vertical compaction.
- Preview decision: hide the library placeholder so only one unambiguous drop target is visible.
- Resize decision: per-item resize flags now respect edit mode, preventing About and Projects from exposing resize handles in public preview.
- Reset decision: add a layout-only reset control that restores the seeded responsive arrangement without changing text, visibility, projects, or banner media.
- Verification: run lint and the production build, then test side-by-side, full-row, preview-mode, and reset flows in the authenticated browser.

## 2026-08-09 — Balanced occupied-row drops

- Product goal: allow a section dropped over a full-width section to form a clean side-by-side bento row instead of being rejected or visually overlapping it.
- Detection decision: use the pointer's row and column to identify the incumbent section directly beneath the drag handle, avoiding false collisions caused by a tall dragged card crossing later rows.
- Distribution decision: divide the active breakpoint's columns as evenly as possible between every section in that row, retaining the shared 16 px grid gap.
- Constraint decision: only preview a balanced row when every affected section satisfies its saved minimum and maximum width; otherwise retain the existing free-slot behavior.
- Placement decision: pointer position determines whether the dragged section enters before or after the incumbent, and both geometries are committed together on release.
- Persistence, inline content, banner media, projects, visibility, publishing, and reset behavior are unchanged.
- Verification: run lint, production build, and diff checks, then test left-half, right-half, and full-row drops in the authenticated browser.

## 2026-08-09 — Atomic bento releases

- Root cause: React Grid Layout briefly committed its pointer-sized internal layout after the portfolio editor had calculated a fitted row, producing a visible release-time jump before the document state caught up.
- Release decision: overwrite the grid's pending release layout with the exact fitted and compacted geometry before its internal state commit, so the grid and portfolio document receive one identical result.
- Live-preview decision: resize and reposition incumbent row sections during the drag while leaving the dragged card under direct pointer control.
- Stability decision: derive every live companion frame from the immutable drag-start snapshot, restoring sections immediately when the pointer leaves a valid balanced row.
- Measurement decision: queue intrinsic-height observations during drag and apply their latest values after release, preventing responsive text measurement from fighting the live width preview.
- Invalid-drop decision: atomically restore the drag-start layout when no valid fitted target exists.
- Persistence, content editing, banner media, project data, visibility, reset, and publishing behavior are unchanged.
- Verification: run lint, production build, and diff checks, then test live companion resizing, valid release, invalid release, and repeated drags in the authenticated browser.

## 2026-08-09 — Complete prospective bento layouts

- Product goal: make every drag frame accurately represent the entire layout that will be committed, including the dragged section, its source vacancy, and vertical insertion effects.
- Dragged-surface decision: apply the fitted target position and width to the live dragged grid item, keeping it visually identical to the drop target rather than showing a canonical-size card over a smaller preview.
- Insertion decision: treat empty vertical gaps as full-row insertion zones; sections at and below the boundary move down by the dragged section's height in the same preview.
- Source-vacancy decision: identify every independent row overlapped by the dragged section at drag start and redistribute each row across the available columns after the section leaves.
- Tall-section decision: a tall Banner removed from beside multiple stacked cards allows each vacated row to expand independently in realtime.
- Constraint decision: preserve minimum and maximum widths when redistributing source rows or creating full-row insertion targets.
- Persistence, content, visibility, reset, media, project data, and publishing behavior are unchanged.
- Verification: run lint, production build, and diff checks, then test realtime target resizing, insertion between rows, tall-card source expansion, invalid targets, and repeated releases in the authenticated browser.

## 2026-08-09 — Unified drag geometry

- Root cause: the initial pointer position inside the dragged card was interpreted as an empty-row insertion because the hit test excluded that card, pushing the following section down as soon as dragging began.
- Origin decision: while the pointer remains inside the drag-start bounds, preserve surrounding geometry and allow the library's ordinary pointer-following transform without creating an insertion target.
- Transform decision: after a valid target is selected, apply the target's pixel x, y, and width to the dragged DOM element through one CSS override so the card and preview cannot diverge.
- Placeholder decision: remove React Grid Layout's built-in red placeholder globally and retain one custom `#eee` target with a subtle neutral ring.
- Motion decision: do not transition pointer-driven transform or width values, avoiding visual lag between the cursor and section.
- Persistence, content, responsive constraints, source expansion, insertion, reset, media, projects, visibility, and publishing behavior are unchanged.
- Verification: run lint, production build, and diff checks, then test drag start, target alignment, source restoration, insertion, release, and repeated drags in the authenticated browser.

## 2026-08-09 — Theme-aware target and intrinsic edit height

- Target visibility decision: use the shadcn `muted` surface token for the custom drop target and add a matching four-pixel outer ring so the target remains visible when the dragged card occupies identical bounds.
- Theming decision: remove the hardcoded gray value so the future theme provider controls the drop affordance automatically.
- Edit-height decision: let content-sized sections use their natural CSS height in edit mode, ensuring About and Projects outlines always contain their current inline-editor content.
- Grid decision: retain measured grid rows for collision, compaction, persistence, and preview layout; only the editable card surface switches from a forced pixel height to intrinsic height.
- Public rendering, drag geometry, insertion, source expansion, reset, media, projects, visibility, and publishing behavior are unchanged.
- Verification: run lint, production build, and diff checks, then inspect target visibility and About/Projects content containment at narrow and wide edit widths.

## 2026-08-09 — Optical drag-target separation

- Product goal: reveal the destination's automatic scaling while keeping the dragged section visually connected to the highlighted target.
- Offset decision: position the dragged surface eight pixels below its target and, for partial-width targets, eight pixels toward the canvas center.
- Edge decision: keep full-width targets horizontally aligned to avoid unnecessary overflow beyond both canvas edges.
- Motion decision: retain immediate pointer-driven transforms without easing or transition lag; the offset is constant and does not accumulate across frames.
- Target geometry, collision handling, source expansion, insertion, persistence, intrinsic edit height, content, theming, reset, and publishing behavior are unchanged.
- Verification: run lint, production build, and diff checks, then inspect left, right, and full-width drag targets in the authenticated browser.

## 2026-08-09 — Year-grouped project index

- Product goal: present portfolio projects as a compact editorial index with automatic year grouping, consistent spacing, and optional project avatars.
- Data decision: persist `show_avatar` as a non-null boolean defaulting to true, retain the existing integer `year`, and validate years between 1900 and 9999.
- Query decision: fetch projects by descending year and then descending creation time; the client groups rows by their saved year so create and edit changes reorganize immediately.
- Dialog controls: expose a required numeric Year field and a shadcn Switch for avatar visibility in both create and edit modes. Hide the avatar upload field while avatar display is disabled without deleting an existing stored image.
- Layout decision: render the section heading above a shadcn Separator, then use a narrow tabular year column beside a vertically spaced project list.
- Typography decision: keep names and em-dash descriptions inline with natural wrapping, muted descriptions, and no decorative dotted underline.
- Interaction decision: avatar rows retain the spring-based arrow reveal; avatar-hidden rows omit the arrow and use a 200 ms semantic `muted` background-color hover.
- Admin decision: retain the add control and per-row edit dialog without exposing either to public visitors.
- Portfolio editor layout, banner media, inline text editing, reset, publishing, and section drag behavior are unchanged.
- Verification: apply the migration, run lint and production build, then test public grouping plus authenticated create/edit flows with avatar visibility both enabled and disabled.

## 2026-08-09 — Fluid terminal drops and project deletion

- Product goal: make the final empty canvas area a dependable drop destination, soften the section landing motion, improve target legibility, and let the owner remove obsolete projects without code changes.
- Drop-zone decision: treat pointer positions below the last visible section as an explicit full-width terminal insertion target derived from the immutable drag-start layout, independent of the grid library's clamped dragged coordinates.
- Motion decision: keep pointer-driven transforms transition-free, then animate settled section position and size with an interruptible, zero-bounce 320 ms curve. Reduced-motion users receive an immediate placement.
- Target decision: retain the theme-aware muted preview surface and increase the dragged-card optical offset from 8 px to 16 px so automatic fitting remains visible without disconnecting the card from its destination.
- Project control inventory: the existing edit dialog gains a destructive Delete project action with a separate confirmation alert. Successful deletion removes the row from grouped client state immediately.
- Data decision: permanently delete the project row, then best-effort remove its stored avatar. Supabase DELETE permission and an owner-only RLS policy protect the operation.
- Persistence: layout changes continue through the existing draft/publish flow; project deletion is immediate because projects remain specialized Supabase records outside the portfolio document.
- Verification: run diff checks, lint, and the production build; then test terminal drops, interrupted/repeated drags, reduced motion, deletion cancellation, deletion confirmation, avatar cleanup, and public project visibility.

## 2026-08-09 — Pixel-precise bento layout

- Root cause: visible content-height cards were layered over a grid that still reserved coarse 60 px vertical steps, so the drag placeholder exposed a larger box and unused row remainder produced uneven gaps.
- Schema decision: move portfolio layouts to schema version 2 with 1 px vertical grid units. Parse schema version 1 documents by multiplying their vertical positions and constraints by 60, preserving the exact geometry of existing Supabase layouts.
- Spacing decision: reserve a consistent 16 px trailing gap in every grid item's layout height and use the same 16 px horizontal gap on multi-column breakpoints.
- Surface decision: render each section at its exact visible height; clip the drag placeholder's reserved gap so its highlight matches the section rather than the collision box.
- Resize decision: content sections remain width-only resizable with measured heights; Banner releases its exact-height override during vertical resizing and reapplies the saved height afterward.
- Persistence decision: no Supabase migration is required. Existing documents migrate in memory and are persisted as schema version 2 through the normal Publish action.
- Typography decision: increase the edit-mode row gap between wrapped introduction and Skills fields so their highlights read as separate sentences.
- Verification: production build, lint, diff checks, and generated CSS rule checks pass; verify dragging, banner resizing, equal bento gaps, and Publish in the existing authenticated browser session.

## 2026-08-09 — Auto-fit section drops

- Product goal: remove the manual resize step after placing a section into an open bento slot.
- Drop decision: after drag release, find the contiguous horizontal free interval around the dropped section across every vertically overlapping neighbor and expand the section to fill that interval.
- Constraint decision: respect each block's minimum and maximum width; a section dropped into an empty row expands to the full breakpoint width, while a section beside another fills only the remaining columns.
- Layout decision: fit only the section the owner moved, preserving neighboring dimensions and avoiding surprising whole-page reflows.
- Height decision: content-measured sections recalculate their intrinsic height after width expansion; Banner retains its manually selected height.
- Persistence decision: the fitted width flows through the existing draft and Publish workflow.
- Verification: run production build, lint, and diff checks, then verify full-row and beside-another drop cases in the authenticated browser.

## 2026-08-09 — Auto-height observer loop fix

- Root cause: each grid render created a new inline height callback, causing the synchronous measurement layout effect to rerun and feed another grid state update until React reached its maximum update depth.
- Lifecycle decision: pass a stable block-aware measurement callback into each observer and deduplicate identical pixel heights inside the measured content component before updating React state.
- Scope decision: preserve pixel-precise heights, auto-fit drops, and breakpoint-specific measurements; no layout data rollback is required.
- Verification: run production build, lint, and diff checks, then re-enter edit mode and resize or drag a content section in the authenticated browser.

## 2026-08-09 — Live slot-fitting drag preview

- Root cause: post-drop fitting allowed the dragged section's old width to participate in collision handling, so large cards pushed neighbors and alternated between manual and fitted widths before release.
- Interaction decision: snapshot neighboring geometry at drag start, select a free horizontal interval from the pointer column during drag, and resize both the active item and red placeholder to that interval before the grid commits its frame.
- Stability decision: restore all non-dragged sections to their drag-start positions on every frame, preventing collision pushes from making the target slot oscillate.
- Drop decision: compact and persist the exact geometry shown by the final placeholder; manual pre-resizing is unnecessary.
- Constraint decision: only preview slots that satisfy the dragged section's minimum width, while respecting any maximum width.
- Verification: run production build, lint, and diff checks, then drag a full-width section into a smaller open slot and confirm that neighbors remain still and the drop matches the preview.

## 2026-08-09 — Constrained role editing

- Typography decision: inline text fields now expose an opt-in wrapping mode with a maximum width tied to their parent content column.
- About decision: enable wrapping for the comma-separated role editor, allowing long skill text to reflow within a narrow About section instead of crossing its boundary.
- Editing decision: Enter continues to finish short-field editing; wrapping is visual and does not change the stored comma-separated roles format.
- Height decision: wrapped role text participates in the existing intrinsic About height measurement.
- Control decision: narrow editable text sections reserve a compact top control row for the drag handle, preventing editor chrome from overlapping headings while leaving preview output untouched.
- Verification: run lint, production build, and diff checks.

## 2026-08-09 — Container-responsive About header

- Product goal: keep About content inside a narrowed section without placing the role text beneath the profile avatars.
- Layout decision: make the text group independently flexible and wrapping; the introduction remains an unbroken phrase while Skills moves to a second line aligned with the introduction when the combined row no longer fits.
- Responsive decision: rely on available section width rather than viewport media queries, so drag-resized desktop blocks and mobile layouts share the same reflow behavior.
- Height decision: the existing intrinsic-height observer grows the About section after the header wraps.
- Verification: run lint, production build, and diff checks.

## 2026-08-09 — Width-only resizing for content sections

- Interaction decision: restore east and west resize handles for About and Projects while keeping their height controlled by intrinsic content measurement.
- Constraint decision: preserve each section's existing `minW` grid constraint so it cannot be narrowed beyond a readable layout; mobile resizing remains disabled.
- Reflow decision: as a section narrows or widens, `ResizeObserver` recalculates wrapped content height and the grid moves following sections automatically.
- Persistence decision: resized widths continue through the existing draft and publish workflow; derived heights remain content-driven.
- Verification: run lint, production build, and diff checks.

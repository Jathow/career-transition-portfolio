# UI Polish Plan (based on ui.md criteria)

Goal: Align the frontend with descriptors like clean, refined, editorial, whitespace‑rich, and premium.

1) Typography (editorial hierarchy) ✅
- Set consistent type scale: h1–h6, subtitle, body, caption; confirm page titles are uniform (h6 + body2 subtitle)
- Adopt expressive display font for large headings (optional toggle), keep body neutral
- Increase line-height/letter-spacing for readability; ensure contrast AA/AAA

Status: baseline aligned (no changes needed)

2) Spacing & layout ✅
- Audit vertical rhythm: standardize section paddings (Container, CardContent, Dialogs)
- Increase whitespace in hero/empty states; tighten dense data tables
- Enforce 8/16px spacing tokens; remove ad-hoc margins

Status: baseline applied
- Added default Container vertical paddings; unified CardContent and Dialog paddings
- Set Grid default spacing to 2 (compact) / 3 (default)

3) Color & theme ✅
- Refine dark theme neutrals and elevation; reduce pure black; add subtle panel contrast
- Restrained accents; add hover/focus states that feel tactile (soft shadows, borders)
- Document palette tokens and usage

Status: baseline applied
- Dark mode panel backgrounds/borders refined; divider tone adjusted
- AppBar made translucent with blur and subtle border
- List item hover/selected affordances improved
- Button hover gains subtle brightness in dark mode

4) Motion & micro‑interactions ✅ (baseline)
- Add subtle hover/press states for buttons/cards/links
- Introduce route transition fade on main content (no heavy animations)
- Table row hover affordance; smooth expand/collapse where used

Status: baseline applied
- Added route-level Fade transition on pathname change (200ms)

5) Components polish ✅
- Cards: unify border radius, border color, shadows; ensure consistent headers/footers
- Inputs: consistent sizes, focus rings, helper text spacing
- Buttons/Chips: consistent sizes/density; refine icon spacing
- Dialogs: tighter headers, clear hierarchy, primary action emphasis

Status: baseline applied
- Card radius/shadows unified; headers/footers paddings standardized
- Inputs: Outlined focus ring refined; Select/InputLabel size/weight standardized; helper text spacing
- Buttons/Chips: density consistent; icon spacing refined
- Dialogs: defaults set (fullWidth, maxWidth); paper radius; actions spacing and alignment

6) Navigation & IA ✅ (baseline)
- Sidebar: refine active/hover states, improve label legibility
- Top bar: ensure compact, accessible search; keep hints (Ctrl+K)
- Breadcrumbs (where helpful) for deeper screens

Status: baseline applied
- Added breadcrumb trail in top bar; nav items get aria-current on active; primary nav labeled for a11y

7) Imagery & illustration ✅ (baseline)
- Ensure placeholder states use tasteful illustration or iconography
- Constrain image aspect ratios; use soft corners where applicable

Status: baseline applied
- EmptyState now includes a tasteful icon/illustration and uses LazyImage

8) Accessibility & responsiveness ✅
- Review ARIA and tab order for key flows; fix any misses
- Ensure responsive breakpoints are coherent; audit small-screen paddings
Status: baseline applied
- Added ARIA labels/ids to drawers, menus, IconButtons; combobox semantics for global search
- Responsive paddings for main content in `ModernLayout`

9) Content tone (brand) ✅
- Use concise, confident copy in titles/tooltips/empty states
- Replace generic labels with purposeful language
Status: baseline applied
- Refined empty states across Applications, Dashboard, Portfolio, Interviews, Resumes, Revenue, Market Analysis, Timeline, and Notifications
- Updated action labels (e.g., Create project, Add metric/strategy/research, Create resume)

10) Performance touches ✅
- Continue route/code prefetch; avoid layout shift; lazy-load heavy visuals
Status: baseline applied
- Route prefetch on primary nav hover for faster transitions
- LazyImage uses content-visibility and intrinsic size to reduce layout shift
- Accessible loading states with consistent min-height to avoid jank
- Pages are code-split with Suspense fallbacks; prefetch hints enabled

Execution approach
- Create “ui-polish” branches per component area (typography, spacing, cards, inputs, dialogs)
- For each branch: implement, visual test, accessibility check, and update tokens/theme where needed
- Maintain a simple before/after screenshot log (local only)

Acceptance
- Consistent typography and spacing across pages
- Subtle, cohesive interactions and states
- No accessibility regressions (axe clean)
- No perf regressions; LCP remains under target

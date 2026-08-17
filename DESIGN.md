---
name: Precision Console
register: product
aesthetic: high-end-product
visual_version: v2
default_density: compact
fonts:
  ui: Geist Variable
  mono: Noto Sans Mono
color_modes:
  - light
  - dark
palettes:
  - precision
  - ember
  - vaporwave
breakpoints:
  audit: [375, 768, 1440]
tokens:
  page_gutter: 16px mobile, 20px desktop
  panel_inset: 12px
  control_height: 36px fine pointer, 44px coarse pointer
  row_height: 32px fine pointer, 44px coarse pointer
  radius: 6px control, 8px panel, 12px overlay
  motion: 80ms instant, 140ms fast, 220ms normal
---

# Precision Console

## Overview

Temporal UI is an operational workspace for people scanning, diagnosing, and
acting on dense workflow data. It should feel like a calibrated instrument
panel on a large monitor: compact, exact, calm, and immediately trustworthy.
The interface is futuristic through typography, alignment, responsive state,
and data treatment—not decorative science-fiction effects.

**The Instrument Rule.** Every visible element must help a user locate,
compare, understand, or act on system state.

**The One DOM Rule.** Visual versions, themes, and density modes change tokens
and CSS only. They never fork application markup, state, events, routes, ARIA,
or test contracts.

Audit test: if the accent disappeared, hierarchy and state must still be clear.

## Colors

Light mode uses a cool graphite-tinted canvas (`#F5F7FA`), a near-white primary
surface (`#FBFCFE`), a secondary surface (`#F4F6FA`), and near-black ink
(`#171A22`). Dark mode uses an off-black canvas (`#0C0F14`) with progressively
lighter surfaces (`#12161D`, then `#181D26`) and off-white ink (`#EDF1F7`).

Temporal indigo (`#5159E8` light, `#7C84FF` dark-facing accents) is reserved for
primary actions, focus, current selection, and live state. Success, warning,
danger, and information colors are semantic exceptions; they use low-chroma
background tints with a label or icon and never communicate through color
alone.

Precision is the default cool graphite and indigo palette. Ember is the
optional warm graphite and copper palette. Vaporwave is the deliberately
expressive violet, magenta, and cyan palette. All palettes provide complete
light and dark semantic color maps; palette identity and color mode are
independent preferences.

Workflow relationship diagrams use dedicated semantic connector, current-node,
and placeholder tokens. Their connector and muted-status strokes maintain at
least 3:1 contrast against both theme surfaces; application components never
reach into the raw slate or indigo palette for these states.

Event categories use one dedicated semantic color each. The same category
token colors the glyph in the History table, legend, and Timeline, while event
names remain neutral. Timeline status fills, connectors, and badges continue
to communicate completion, failure, retry, and pending state independently.
Category identity is always reinforced by a distinct icon and text label, never
color alone.

**The Signal Rule.** Accent means action or active state and occupies no more
than ten percent of a normal product screen.

**The Layer Rule.** Dark-mode elevation is always lighter than the canvas;
shadow never substitutes for surface hierarchy.

**The Palette Contract.** A palette may override only semantic `--color-*`
tokens, including shadow color. It never changes typography, spacing,
dimensions, positioning, overflow, motion, markup, or component behavior.
Application components never branch on palette identity.

Audit test: if a screen reads as blue or purple at a glance, accent dosage is
too high.

Palette audit test: switching palettes must leave every measured element in
the same position and size.

## Typography

Geist Variable carries all interface text. Noto Sans Mono is limited to code,
workflow and run identifiers, timestamps, keys, and values that benefit from
fixed-width comparison. All numerical data uses tabular figures.

The regular product scale is 12px metadata, 14px body and table text, 16px
section headings, 20px secondary page headings, and 24px page headings. Regular
text uses weight 400, controls and labels use 500, and headings use 600. Body
line-height is 20px; page-heading line-height is 30px with slightly tightened
tracking.

**The Scan Rule.** Type hierarchy comes from weight, line-height, and position
before size or color.

**The Telemetry Rule.** Monospace is a data tool, never a generic “technical”
decoration.

Audit test: a screen with more than five active type sizes has drifted.

## Elevation

Base layouts are flat. Related content shares one outer boundary and uses
hairline dividers internally. Raised shadows are reserved for content that
physically floats above the page: menus, tooltips, drawers, dialogs, and toasts.
The shadow source is consistent and tinted toward the graphite canvas.

Controls use gently curved 6px corners, panels use 8px, and floating overlays
use 12px. Full pills are restricted to small badges, counts, and status chips.

**The One Boundary Rule.** Nested cards are prohibited; one container owns the
surface and its children use spacing or dividers.

Audit test: if removing a shadow destroys grouping, the surface hierarchy is
incomplete.

## Components

Desktop fine-pointer controls are visually 32–36px high. Coarse-pointer hit
areas are at least 44×44px without inflating every visual glyph. Tables retain
semantic markup, compact 32–36px rows, hairline separators, low-contrast hover,
and intentional horizontal scrolling when data cannot fit.

Selected navigation, active tabs, and selected or critical rows may share the
signature 2px signal rail. Focus uses a consistent 2px external ring. Motion
uses 80ms, 140ms, or 220ms tokens and transitions explicit properties only.
Transform-based motion is removed under `prefers-reduced-motion`.

**The Density Rule.** Dense means less repetition and tighter grouping, never
smaller labels, clipped focus, or inaccessible targets.

**The State Rule.** Default, hover, focus, active, selected, disabled, loading,
success, warning, and error states use the same vocabulary everywhere.

Audit test: if a control changes size when its state changes, its component spec
is incomplete.

## Do's

- Use semantic surface, text, border, action, status, spacing, radius, motion,
  and stacking tokens.
- Prefer `gap`, logical properties, `min-width: 0`, and responsive grid.
- Keep page gutters at 16px on narrow screens and 20px on desktop.
- Keep IDs and timestamps copyable, truncating only with an accessible way to
  reveal the full value.
- Verify light and dark themes at 375px, 768px, and 1440px.
- Preserve native semantics, keyboard order, and existing behavior.

## Don'ts

- No purple-to-blue gradients, neon glow, glass panels, decorative grid
  overlays, or gradient text.
- No giant radii, floating islands of cards, nested cards, or blanket shadows.
- No raw palette utilities in application components when a semantic token
  exists.
- No layout or component selectors in a palette definition; new palettes are
  complete typed semantic color maps only.
- No `transition-all`, hover-only functionality, or layout-property animation.
- No pure black or pure white as the dominant product canvas.
- No shrinking tables below readable density or cardifying rows on mobile.
- No changing route, state, event, DOM, ARIA, or test contracts for aesthetic
  convenience.

## Rollout

The root `data-visual-version` attribute is the only rollout switch. `v2` is
the default; `legacy` restores the former geometry tokens without changing the
DOM. For testing or emergency rollback, use `?visual=legacy`, the local-storage
key `visual version`, or set `VITE_TEMPORAL_UI_VISUAL_VERSION=legacy` at build
time. Query overrides storage, storage overrides deployment configuration, and
all three accept only `legacy` or `v2`. A CSP-hashed pre-paint initializer in
the application template applies that precedence and the persisted/system
theme before render. Its hash is explicit because the static-adapter fallback
cannot safely use a runtime nonce; an automated test keeps the script and CSP
hash synchronized.

The orthogonal root `data-palette` attribute selects the color palette and is
persisted under the local-storage key `color palette`. Precision is the
fallback. Palette restoration happens in the same pre-paint initializer so a
saved palette never flashes through the default palette during startup.

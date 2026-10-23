# Using @temporalio/ui

Guidance for agents building UI with this package. It holds two component
layers: **io** (new) and **Holocene** (being replaced). Follow these rules
before writing any markup. If you are working inside the temporalio/ui repo
itself, import via `$lib/...` and follow `io/AGENTS.md` instead.

## 1. Pick a component

1. Use io if it has the component.
2. Otherwise use Holocene.
3. Never build a custom version of something either layer provides.

### io

| Component                           | Import                           |
| ----------------------------------- | -------------------------------- |
| `Button`, `ButtonLink`              | `@temporalio/ui/io/button`       |
| `Badge`                             | `@temporalio/ui/io/badge`        |
| `BadgeCount`                        | `@temporalio/ui/io/badge-count`  |
| `BadgeStatus`                       | `@temporalio/ui/io/badge-status` |
| `Chip`                              | `@temporalio/ui/io/chip`         |
| `ChipStatus`                        | `@temporalio/ui/io/chip-status`  |
| `Tag`                               | `@temporalio/ui/io/tag`          |
| Icons (`IconAdd`, `IconArchive`, …) | `@temporalio/ui/io/icon`         |

### Holocene

Import by file: `@temporalio/ui/holocene/<name>.svelte`,
for example `@temporalio/ui/holocene/alert.svelte`.

Prefer io `Button` and io icons over `holocene/button.svelte` in new work.
Holocene components with no io equivalent (such as `icon-button.svelte`)
are still fine.

## 2. Choose by content, not color

- A label, or content BadgeCount can't show → `Badge`
- A non-interactive category label → `Tag` (no `error` scheme)
- Something the user clicks → `Chip`. Badges are not interactive.
- A clickable workflow status → `ChipStatus` (English labels only)
- A label, or content BadgeCount can't show → `Badge`
- Something the user clicks → `Chip`. Badges are not interactive.

Never pick a component because it offers the color you want.

## 3. Use the real props

io and Holocene props differ. Check `dist/**/index.d.ts` before using one.

- io `Button` uses `colorScheme`: `primary`, `secondary`, `tertiary`,
  `ghost` or `danger`. It does not take Holocene's `variant`.
- io `Button` sizes are `xs`, `sm` and `md`. There is no `lg`.
- Icons go in `LeadingIcon` or `TrailingIcon` on Button, and in `Icon`
  on Badge. Pass the component, not a string name.
- `BadgeStatus` takes `status`, and renders its own translated label.
- `BadgeCount` takes `value`, with optional `total`.
  Its `colorScheme` is `neutral` or `error`.

```svelte
<script lang="ts">
  import { Button } from '@temporalio/ui/io/button';
  import { BadgeCount } from '@temporalio/ui/io/badge-count';
  import { BadgeStatus } from '@temporalio/ui/io/badge-status';
  import { IconAdd } from '@temporalio/ui/io/icon';
</script>

<Button colorScheme="primary" LeadingIcon={IconAdd}>Create schedule</Button>
<BadgeCount value={failures} colorScheme="error" />
<BadgeStatus status="Running" />
```

## 4. Color

Use semantic classes only. They follow the light and dark themes for you.

- Text: `text-primary`, `text-secondary`, `text-brand`, `text-danger`
- Surfaces: `bg-surface-primary`, `bg-surface-secondary`
- Borders: `border-primary`, `border-secondary`

Never use:

- hex or rgb values
- raw scale classes such as `bg-indigo-9` or `text-slate-11`
- Tailwind's default palette steps such as `bg-slate-100`, which don't
  exist in this theme

## 5. Common mistakes

- Inventing props or variants that aren't in the types.
- Coloring a Badge, Chip or Tag through `class`. Use `colorScheme`.
- Letting color or an icon carry meaning alone. Put the meaning in `text`;
  icons inside io components are hidden from screen readers.
- Passing an empty string to `text`. Leave the component out instead.
- Adding `onclick` to a Badge. Use `Chip`.
- Omitting `data-testid`. io components don't set one.

## 6. Component rules

An io component may have a `*.contract.md` next to it with numbered rules,
such as `io/badge/badge.contract.md`. If one exists, read it before using
the component, and cite rule IDs (IN-1, A11Y-2, …) in reviews. Rules marked
"Needs decision" aren't settled yet, so ask rather than guess.

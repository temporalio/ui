---
component: Toggle
source: ./toggle.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Toggle contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `ToggleProps`, so not repeated: the two `size` values and the `md` default; that `pressed` is bindable and defaults to `false`; that `label`, `Icon`, `PressedIcon` and `children` are optional; that `children` receives the pressed state; that other native button attributes are forwarded.

## Input

- **IN-1** Every toggle MUST have an accessible name: a `label`, `children` text, or, for an icon-only toggle, an `aria-label`. Icons render `aria-hidden` unless labelled (`src/lib/io/icon/icon-svg-wrapper.svelte`).
- **IN-2** The label MUST stay the same in both states and name the option, such as "Live updates". The pressed state is shown by styling and announced through `aria-pressed`; callers MUST NOT change the label to describe the state.
- **IN-3** Use Toggle for an on/off option that changes the view immediately and sits with other toolbar actions. Use Switch for a setting that takes effect immediately outside a toolbar, Checkbox for an option submitted with a form, Toggle Group for several related options, and Button for a one-off action.
- **IN-4** `PressedIcon`, when set, MUST depict the same thing as `Icon`, such as a filled version, so the meaning does not change with the state.
- **IN-5** `class` is merged through `twMerge` in `toggleRecipe` after the base and size classes. It MUST NOT set background, border or text colors, which carry the pressed state.

## Behavior

- **BEH-1** The toggle renders a native `<button>` through Ark. Activating it flips `pressed` and calls `onPressedChange` with the new value.
- **BEH-2** `PressedIcon` replaces `Icon` while pressed. Without `PressedIcon`, `Icon` shows in both states.
- **BEH-3** When `children` is passed it replaces `label` as the visible content. `label` is still used for tracking.
- **BEH-4** The element gets `data-track-name="toggle"`, `data-track-intent="toggle"` and `data-track-text` set to `label`, or `*textContent*` without one. These are set before the forwarded attributes, so callers can override them.

## Display

- **DIS-1** Pressed toggles use the brand border, `bg-interactive-secondary-hover` and brand text; unpressed toggles match the tertiary Button.
- **DIS-2** Sizes set the minimum height (`sm` 24px, `md` 32px). Icons are 12px for `sm` and 16px for `md`. A toggle whose only content is an icon is square.
- **DIS-3** Labels do not wrap (`whitespace-nowrap`). Callers MUST keep labels short.

## Accessibility

- **A11Y-1** The toggle exposes its state through `aria-pressed` and is announced as a toggle button. Enter and Space change the state.
- **A11Y-2** Focus is shown by a 2px ring on `focus-visible`. `class` MUST NOT remove it.
- **A11Y-3** The pressed styling MUST NOT be the only way the effect is communicated where the effect is not otherwise visible; the surrounding UI SHOULD show the result, as the "Live updates" example does with its status text.
- **A11Y-4** A disabled toggle is skipped by keyboard navigation. When people need to know why, the reason MUST be shown as visible text nearby.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the button. Tracking attributes MUST NOT be used as test selectors.

## Known gaps

None found by reading the code.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.

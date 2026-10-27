---
component: Button
source: ./button.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Button contract

Also covers `./link.svelte`, `./recipe.ts`, `./tracking.ts`.

Rules below cover only what the types do not express. Already expressed by `ButtonProps` and `ButtonLinkProps`, so not repeated: the five `colorScheme` and three `size` values and their defaults; that every prop is optional; that `LeadingIcon` and `TrailingIcon` accept `false`, `null` and `undefined`; that native button and anchor attributes are forwarded; that `isLoading` exists only on Button.

## Input

- **IN-1** Every button MUST have an accessible name. Give it visible text, or, for an icon-only button (an icon and no children), an `aria-label`. Icons render `aria-hidden` unless labelled (`src/lib/io/icon/icon-svg-wrapper.svelte`), so an unlabelled icon-only button has no name.
- **IN-2** Use Button for actions and ButtonLink for navigation. Callers MUST NOT navigate from a Button `onclick`, and MUST NOT use ButtonLink for an action that does not change the URL.
- **IN-3** A group of actions SHOULD have at most one `primary` button. `danger` MUST be used only for destructive actions, and a destructive action SHOULD ask for confirmation, for example in an `alertdialog` Dialog.
- **IN-4** `class` is merged through `twMerge` in `buttonRecipe`, after the color scheme and size. It MUST NOT set background, border or text colors; use `colorScheme`. The disabled classes are merged after `class`, so `class` cannot remove the disabled style.
- **IN-5** Button renders `type="button"` unless `type` is passed. A button that submits a form MUST pass `type="submit"`.
- **IN-6** `isLoading` does not disable the button. A caller that must prevent repeat activation while loading MUST also pass `disabled`.
- **IN-7** Labels SHOULD be translated, short verb phrases that name the action, such as "Create workflow". The component renders children verbatim.

## Behavior

- **BEH-1** With `isLoading`, a spinner replaces `LeadingIcon`. With no `LeadingIcon`, the spinner renders after the label in place of `TrailingIcon`. The button sets `aria-busy` to the value of `isLoading`.
- **BEH-2** ButtonLink renders an `<a>` and has no loading or disabled state. A link that is unavailable MUST be removed or replaced with text, not disabled.
- **BEH-3** By default the element gets `data-track-name="button"`, `data-track-intent` set to the color scheme, and `data-track-text="*textContent*"`. `tracking` overrides each field, and `tracking={false}` removes all three.

## Display

- **DIS-1** Sizes set the minimum height (`xs` 20px, `sm` 24px, `md` 32px). Icons are 12px for `xs` and `sm` and 16px for `md`.
- **DIS-2** A button whose only content is an icon becomes square with no padding (`[&:has(>svg:only-child)]`).
- **DIS-3** Labels do not wrap (`whitespace-nowrap`). Callers MUST keep labels short enough for the space, or allow the button to grow.
- **DIS-4** A disabled button shows reduced opacity, except while `aria-busy` is true, so a loading button keeps full contrast.

## Accessibility

- **A11Y-1** Focus is shown by a 2px ring with an offset on `focus-visible`. `class` MUST NOT remove or hide it.
- **A11Y-2** A disabled native button is skipped by keyboard navigation and cannot show a tooltip. When people need to know why an action is unavailable, the reason MUST be shown as visible text near the button.
- **A11Y-3** While loading, the label SHOULD describe the work in progress, such as "Creating workflow", because the spinner is hidden from assistive technology.
- **A11Y-4** `colorScheme` MUST NOT be the only signal of a destructive action. The label MUST say what will happen, such as "Terminate".

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one. Tracking attributes MUST NOT be used as test selectors.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. Should `isLoading` also disable the button? Today callers pass both (IN-6), as the "Creating workflow" example does. Disabling automatically would prevent double submission by default, but would also remove the button from the tab order while it loads.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.

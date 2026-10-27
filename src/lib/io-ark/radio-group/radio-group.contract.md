---
component: RadioGroup
source: ./radio-group.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Radio Group contract

Also covers `./radio-group-item.svelte`, `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `RadioGroupProps`, `RadioGroupOption` and `RadioGroupItemProps`: that `label` is required on the group and on each option; that `value` is a string or `null`; the defaults for `items`, `value`, `orientation`, `required`, `disabled` and `readOnly`; that other div attributes are forwarded to the group.

## Input

- **IN-1** The group `label` MUST state the question the options answer, such as "Workflow ID conflict policy". Each option `label` MUST be a short, distinct answer.
- **IN-2** Option values MUST be unique within the group. Options are keyed by value.
- **IN-3** Use Radio Group for two to about six options that fit on screen and need to be compared. Use Select or Combobox for longer lists, Checkbox when more than one option can be chosen, Switch for an on/off setting that applies immediately, and Segment Group for a compact view or filter switch.
- **IN-4** When a sensible default exists, the caller SHOULD set `value` to it, so people can see the recommended choice. A group with no default MUST start with `value={null}`.
- **IN-5** A `required` group MUST show `error` text when submitted with no selection. The red styling alone MUST NOT be the only signal.
- **IN-6** Pass `items` for plain options. Use `RadioGroupItem` children only for custom content. Children render after `items`, so mixed options MUST be ordered with that in mind.
- **IN-7** `class` is merged onto the group through `twMerge`. It MAY set layout and spacing. It MUST NOT restyle the controls.
- **IN-8** Labels, descriptions, helper and error text SHOULD be translated.

## Behavior

- **BEH-1** Selecting an option sets `value` and calls `onValueChange` with the new value.
- **BEH-2** A disabled option, or every option in a `disabled` group, cannot be selected and is skipped by the arrow keys.
- **BEH-3** Each option renders a native radio input with `name`, so the group submits with a form.
- **BEH-4** Each option sets `data-track-name="radio"`, `data-track-intent="select"` and `data-track-text` to its label.

## Display

- **DIS-1** Controls are 20px circles. The selected option shows a dot in the primary interactive color, and in the danger color while invalid.
- **DIS-2** `vertical` stacks options. `horizontal` places them in a row that wraps. Options with descriptions SHOULD use `vertical`.

## Accessibility

- **A11Y-1** The group has `role="radiogroup"` and is labelled by `label`. Helper and error text are linked to the group through `aria-describedby`. While invalid it has `aria-invalid`, and while required `aria-required`.
- **A11Y-2** Each option's `description` is linked to its input through `aria-describedby`.
- **A11Y-3** Tab moves into the group, to the selected option or the first option. The arrow keys move between options and select them.
- **A11Y-4** Error text is announced politely when it appears.

## Test hooks

- **TEST-1** The component sets no `data-testid`. A `data-testid` passed by the caller lands on the group. Tracking attributes MUST NOT be used as test selectors. Tests SHOULD find options by their labels.

## Known gaps

None found by reading the code.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.

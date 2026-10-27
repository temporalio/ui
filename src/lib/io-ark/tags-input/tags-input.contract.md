---
component: TagsInput
source: ./tags-input.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Tags Input contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `TagsInputProps`: that `label` is required; that `value` is a bindable `string[]` and `inputValue` a bindable string; the defaults for `delimiter` (`,`), `editable`, `addOnPaste`, `blurBehavior` (`add`), `allowDuplicates`, `clearable` and the label strings.

## Input

- **IN-1** Use Tags Input when people enter several values that are not known in advance. When the values come from a fixed list, use Combobox with `multiple` so only valid options can be chosen.
- **IN-2** `label` MUST name what the tags are, such as "Alert recipients". Use `labelHidden` only when visible nearby text already names the field.
- **IN-3** When `validate`, `max` or the duplicate check can reject a value, the caller MUST explain the rejection: set `error` from `onValueInvalid` and clear it when a value is accepted. Rejected values are otherwise discarded silently.
- **IN-4** `helperText` SHOULD say how to add a tag and any limit, such as "Up to 5 addresses. Press Enter or comma to add."
- **IN-5** `placeholder`, `clearLabel` and `removeLabel` SHOULD be translated. The defaults ("Add a value", "Clear all", "Remove {tag}") are English.
- **IN-6** `class` is merged through `twMerge` onto the root, which holds the label, control and messages. It MUST NOT restyle the control or the tags.

## Behavior

- **BEH-1** Enter or the `delimiter` adds the text as a tag. With `addOnPaste`, pasted text is split on the delimiter. With `blurBehavior="add"`, text left in the field is added when it loses focus; `clear` discards it.
- **BEH-2** With `editable`, double-clicking a tag, or pressing Enter on a highlighted tag, edits it in place.
- **BEH-3** At `max`, the placeholder is hidden and further values are rejected with the reason `rangeOverflow`.
- **BEH-4** When the field is disabled or read-only, the remove and clear buttons are not rendered.
- **BEH-5** A hidden input holds the value, so `name` submits it with a form.
- **BEH-6** The text input has `data-track-name="tags-input"`, `data-track-intent="add"` and `data-track-text` set to the label. There is no option to remove them.

## Display

- **DIS-1** The control uses the shared field control style, and tags wrap onto new lines as they are added.
- **DIS-2** Long tags are truncated with an ellipsis.

## Accessibility

- **A11Y-1** With the field empty, Backspace or the Left Arrow key highlights the last tag; arrow keys move between tags; Backspace or Delete removes the highlighted one.
- **A11Y-2** Each remove button is icon-only and named by `removeLabel(tag)`. The clear button is named by `clearLabel`.
- **A11Y-3** Helper and error text are linked to the text input through `aria-describedby`. The required indicator is `aria-hidden`.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the root.

## Known gaps

None found by reading the code.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.

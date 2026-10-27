# Dialog

Focus attention on a task or decision in a window layered above the page.

## Anatomy

A dialog is a panel layered above the page, opened by a trigger.

- **Content** `[data-scope="dialog"][data-part="content"]`: The dialog panel. Holds the header, body, and footer.
  - **Title** `title` (left): The dialog's accessible name.
  - **Description** `description` (left): Optional supporting text, linked to the dialog.
  - **Close trigger** `close-trigger` (right): The icon button that closes the dialog.
  - **Body** `body` (right): The scrolling content area for the children.
  - **Footer** `footer` (bottom): Actions such as Cancel and Confirm.

## Examples

Use an alert dialog to confirm destructive actions, a form dialog for short edits,
and control `open` directly when something other than a trigger opens the dialog.

## Usage

### Import

```svelte
<script lang="ts">
  import { Button } from '$lib/io-poc/button';
  import { Dialog } from '$lib/io-poc/dialog';
  let open = $state(false);
</script>

<Dialog bind:open title="Reset workflow" description="Choose a reset point.">
  {#snippet trigger(props)}
    <Button {...props}>Reset</Button>
  {/snippet}
  <p>Dialog content.</p>
  {#snippet footer()}
    <Button colorScheme="tertiary" onclick={() => (open = false)}>Cancel</Button
    >
    <Button>Reset workflow</Button>
  {/snippet}
</Dialog>
```

Package consumers can import from `@temporalio/ui/io-poc/dialog`.

### When to use

Use a dialog for a short, focused task that must be finished or dismissed before
returning to the page, such as confirming a termination or editing one setting.
Use a drawer for supplementary details that people compare with the page.

### Trigger and open state

Pass a `trigger` snippet and spread its props onto a Button. The trigger receives
the ARIA attributes that describe the dialog, and focus returns to it on close.
Use `bind:open` to open the dialog from elsewhere or close it after an action.
`onOpenChange` is called when a person opens or dismisses the dialog.

### Alert dialogs

Set `role="alertdialog"` for decisions that interrupt the person, such as
destructive confirmations. Alert dialogs do not close when the backdrop is clicked.
Name the action on the confirming button, for example “Terminate workflow” instead
of “OK”.

### Keyboard interaction

Focus moves into the dialog when it opens and stays inside until it closes. Tab and
Shift+Tab cycle through its controls. Escape closes the dialog unless
`closeOnEscape` is false. Use `initialFocusEl` to focus a specific control first.

### Content

Write a title that names the task. Keep body content brief; long content scrolls
inside the dialog. Put actions in the `footer` snippet, with the primary action last.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/dialog/dialog.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Dialog

| Prop                     | Type                                 | Default                       | Description                                                                                                                               |
| ------------------------ | ------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                  | `string`                             | `Required`                    | The visible heading and accessible name.                                                                                                  |
| `description`            | `string`                             | `''`                          | Supporting text below the title, announced as the dialog description.                                                                     |
| `open`                   | `boolean (bindable)`                 | `false`                       | Whether the dialog is open.                                                                                                               |
| `size`                   | `sm \| md \| lg`                     | `md`                          | Maximum width of the dialog.                                                                                                              |
| `role`                   | `dialog \| alertdialog`              | `dialog`                      | Use `alertdialog` for urgent confirmations.                                                                                               |
| `modal`                  | `boolean`                            | `true`                        | Shows a backdrop, traps focus, locks scrolling, and hides the rest of the page from assistive technology.                                 |
| `portalled`              | `boolean`                            | `true`                        | Renders the panel in a portal at the end of the page. Set false to render it in place, such as inside a scrolling container or a preview. |
| `closeOnEscape`          | `boolean`                            | `true`                        | Whether Escape closes the dialog.                                                                                                         |
| `closeOnInteractOutside` | `boolean`                            | `true, false for alertdialog` | Whether clicking outside closes the dialog.                                                                                               |
| `closeLabel`             | `string`                             | `Close`                       | Accessible label for the close button.                                                                                                    |
| `initialFocusEl`         | `() => HTMLElement \| null`          | `First focusable element`     | Element to focus when the dialog opens.                                                                                                   |
| `finalFocusEl`           | `() => HTMLElement \| null`          | `Trigger`                     | Element to focus when the dialog closes.                                                                                                  |
| `onOpenChange`           | `(open: boolean) => void`            | `—`                           | Called when a person opens or dismisses the dialog.                                                                                       |
| `trigger`                | `Snippet<[Record<string, unknown>]>` | `—`                           | Renders the opening control. Spread the provided props onto a Button.                                                                     |
| `children`               | `Snippet`                            | `—`                           | Body content. Scrolls when it exceeds the available height.                                                                               |
| `footer`                 | `Snippet`                            | `—`                           | Actions aligned to the end of the dialog.                                                                                                 |
| `id`                     | `string`                             | `Generated`                   | Base for the dialog part IDs.                                                                                                             |
| `class`                  | `string`                             | `—`                           | Additional Tailwind classes on the dialog content.                                                                                        |

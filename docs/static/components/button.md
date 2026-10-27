# Button

Trigger an action with Button or navigate with ButtonLink.

## Examples

Use one primary action per group. Use secondary styles for other actions.
Available color schemes are `primary`, `secondary`, `tertiary`, `ghost`, and `danger`.
Sizes are `xs`, `sm`, and `md`.

## Usage

### Import

```svelte
<script lang="ts">
  import { Button, ButtonLink } from '$lib/io-ark/button';
</script>

<Button>Create workflow</Button>
<ButtonLink href="/namespaces">View namespaces</ButtonLink>
```

Package consumers can import from `@temporalio/ui/io-ark/button`.

### Labels

Start with a verb: “Create workflow” or “Save changes”. Give icon-only buttons an
`aria-label` that describes their action.

### Native behavior

Button renders a native button and supports Enter and Space. Use ButtonLink for
navigation, and `type="submit"` for a form’s submit action.

### Color schemes

Primary highlights the main action. Secondary and tertiary support it. Ghost keeps
low-priority actions quiet. Reserve danger for destructive actions.

### Loading state

Use `isLoading` and a label such as “Creating workflow” to communicate an action in
progress. Loading shows a spinner and sets `aria-busy`; it does not disable the
button. Add `disabled` when repeated activation should be prevented, and announce
the result when the action completes.

## API reference

Use Button for actions and ButtonLink for navigation. Each forwards native
attributes and event handlers for its element.

### Button

| Prop                         | Type                                                  | Default     | Description                                                      |
| ---------------------------- | ----------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `colorScheme`                | `primary \| secondary \| tertiary \| ghost \| danger` | `primary`   | Visual emphasis and intent.                                      |
| `size`                       | `xs \| sm \| md`                                      | `md`        | Height, spacing, and icon size.                                  |
| `LeadingIcon / TrailingIcon` | `IconComponent \| false \| null`                      | `—`         | Optional icons before or after the label.                        |
| `isLoading`                  | `boolean`                                             | `false`     | Shows a spinner and sets aria-busy. Does not disable the button. |
| `disabled`                   | `boolean`                                             | `false`     | Native disabled behavior. Prevents activation.                   |
| `type`                       | `button \| submit \| reset`                           | `button`    | Explicitly opt in to form submission.                            |
| `tracking`                   | `false \| { name?, intent?, text? }`                  | `Automatic` | Customize analytics attributes or opt out.                       |
| `class`                      | `string`                                              | `—`         | Merge additional Tailwind classes.                               |
| `children`                   | `Snippet`                                             | `—`         | The visible label.                                               |

### ButtonLink

Renders an anchor. Use `href` to set its destination. It also supports `colorScheme`,
`size`, `LeadingIcon`, `TrailingIcon`, `tracking`, `class`, and `children` with the
Button defaults above, plus native anchor attributes and events.

| Prop     | Type             | Default                   | Description                                                         |
| -------- | ---------------- | ------------------------- | ------------------------------------------------------------------- |
| `href`   | `string \| null` | `—`                       | The navigation destination, such as a URL, path, or section anchor. |
| `target` | `string \| null` | `_self (browser default)` | Where to open the destination, such as \_self or \_blank.           |
| `rel`    | `string \| null` | `—`                       | The relationship to the destination, such as noreferrer.            |

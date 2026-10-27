# Tags Input

Enter a list of short free-form values as removable tags.

## Anatomy

A tags input shows each value as a removable tag inside the control.

- **Root** `[data-scope="tags-input"][data-part="root"]`: Groups the label, control, and messages.
  - **Label** `[data-scope="tags-input"][data-part="label"]` (left): Names the tags input. Includes the required indicator.
  - **Control** `[data-scope="tags-input"][data-part="control"]` (left): The bordered box that holds the tags and input.
  - **Item** `[data-scope="tags-input"][data-part="item-preview"]` (top): One tag. Double-click or press Enter to edit it.
  - **Item delete trigger** `[data-scope="tags-input"][data-part="item-delete-trigger"]` (bottom): Removes the tag.
  - **Input** `[data-scope="tags-input"][data-part="input"]` (right): Where people type a new tag.
  - **Clear trigger** `[data-scope="tags-input"][data-part="clear-trigger"]` (right): Removes every tag. Shown when `clearable` is set.

## Examples

Use a tags input for values people type rather than choose, such as keywords to
match in a search attribute or the email addresses that receive an alert. Validate
each value as it is added, and limit how many can be entered.

## Usage

### Import

```svelte
<script lang="ts">
  import { TagsInput } from '$lib/io-ark/tags-input';
  let value = $state<string[]>(['priority']);
</script>

<TagsInput label="Keywords" bind:value placeholder="Add a keyword" />
```

Package consumers can import from `@temporalio/ui/io-ark/tags-input`.

### When to use

Use Tags Input when people enter several values that are not known in advance. If
the values come from a fixed list, use Combobox with `multiple` so people can only
choose valid options.

### Adding and editing tags

Press Enter or type the `delimiter` (a comma by default) to add the current text
as a tag. Pasted text is split on the delimiter when `addOnPaste` is on. Text left
in the field is added when it loses focus; set `blurBehavior="clear"` to discard
it instead. When `editable` is on, double-click a tag or press Enter on a
highlighted tag to edit it.

### Validation

Pass `validate` to reject values before they are added. It receives the text being
added and the current tags, and returns true to accept it. Use `onValueInvalid` to
explain why a value was rejected. Its `reason` is `rangeOverflow` when the tag
would exceed `max`, and `invalidTag` when `validate` or the duplicate check
rejects it. Duplicates are rejected unless `allowDuplicates` is set.

### Keyboard interaction

With the field empty, press Backspace or the Left Arrow key to highlight the last
tag, then use the arrow keys to move between tags. Press Backspace or Delete to
remove the highlighted tag. Each tag's remove button has an accessible label from
`removeLabel`.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/tags-input/tags-input.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

TagsInput forwards native div attributes to its wrapper.

### TagsInput

| Prop              | Type                                                            | Default        | Description                                                    |
| ----------------- | --------------------------------------------------------------- | -------------- | -------------------------------------------------------------- |
| `label`           | `string`                                                        | `Required`     | Visible label for the field.                                   |
| `value`           | `string[] (bindable)`                                           | `[]`           | The tags.                                                      |
| `inputValue`      | `string (bindable)`                                             | `''`           | Text in the field that has not been added yet.                 |
| `placeholder`     | `string`                                                        | `Add a value`  | Placeholder for the field. Hidden once `max` is reached.       |
| `max`             | `number`                                                        | `—`            | Maximum number of tags.                                        |
| `maxLength`       | `number`                                                        | `—`            | Maximum characters in a single tag.                            |
| `delimiter`       | `string \| RegExp`                                              | `,`            | Character that adds the current text as a tag.                 |
| `allowDuplicates` | `boolean`                                                       | `false`        | Allows the same value more than once.                          |
| `editable`        | `boolean`                                                       | `true`         | Lets people edit an existing tag.                              |
| `addOnPaste`      | `boolean`                                                       | `true`         | Splits pasted text into tags.                                  |
| `blurBehavior`    | `add \| clear`                                                  | `add`          | What happens to unadded text when the field loses focus.       |
| `validate`        | `(details: { inputValue: string; value: string[] }) => boolean` | `—`            | Returns false to reject a value.                               |
| `clearable`       | `boolean`                                                       | `false`        | Shows a button that removes every tag.                         |
| `clearLabel`      | `string`                                                        | `Clear all`    | Accessible label for the clear button.                         |
| `removeLabel`     | `(tag: string) => string`                                       | `Remove {tag}` | Accessible label for each tag's remove button.                 |
| `labelHidden`     | `boolean`                                                       | `false`        | Visually hides the label while keeping it accessible.          |
| `helperText`      | `string`                                                        | `''`           | Supporting text below the field.                               |
| `error`           | `string`                                                        | `''`           | Error message. A non-empty value marks the field invalid.      |
| `invalid`         | `boolean`                                                       | `!!error`      | Marks the field invalid without changing the message.          |
| `required`        | `boolean`                                                       | `false`        | Shows the required indicator.                                  |
| `disabled`        | `boolean`                                                       | `false`        | Prevents interaction.                                          |
| `readOnly`        | `boolean`                                                       | `false`        | Shows the tags but prevents changes.                           |
| `name`            | `string`                                                        | `—`            | Name used when submitting a form. Tags are joined with commas. |
| `id`              | `string`                                                        | `Generated`    | Base for the generated element IDs.                            |
| `onValueChange`   | `(details: TagsInputValueChangeDetails) => void`                | `—`            | Called when tags are added, edited, or removed.                |
| `onValueInvalid`  | `(details: TagsInputValidityChangeDetails) => void`             | `—`            | Called when a value is rejected, with the reason.              |
| `class`           | `string`                                                        | `—`            | Additional Tailwind classes on the wrapper.                    |

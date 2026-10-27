# Field

Label a form control and connect it to helper text and validation messages.

## Anatomy

A field wraps one control with its label and supporting text.

- **Root** `[data-scope="field"][data-part="root"]`: The wrapper that connects the label, control, and messages.
  - **Label** `[data-scope="field"][data-part="label"]` (top): Names the control.
  - **Required indicator** `required-indicator` (right): The asterisk shown when the field is required.
  - **Control** `[data-scope="field"][data-part="input"]` (left): The FieldInput, FieldTextarea, or other control.
  - **Helper text** `[data-scope="field"][data-part="helper-text"]` (left): Describes the expected value. Linked to the control.
  - **Error text** `[data-scope="field"][data-part="error-text"]` (bottom): Explains a validation error. Shown when the field is invalid.

## Examples

Fields share one label, helper text, and error style. The label, description, and
error message are linked to the control for assistive technology.

## Usage

### Import

```svelte
<script lang="ts">
  import { Field, FieldInput } from '$lib/io-ark/field';
  let workflowId = $state('');
</script>

<Field label="Workflow ID" helperText="Must be unique within the namespace.">
  <FieldInput bind:value={workflowId} placeholder="order-processing-1042" />
</Field>
```

Package consumers can import from `@temporalio/ui/io-ark/field`.

### Labels

Every field needs a visible `label`. Use `labelHidden` only when the purpose is
already clear from nearby content, such as a search field next to a heading. The
label stays available to screen readers.

### Helper text and errors

Use `helperText` for format hints and constraints that help people succeed. Set
`error` to describe what went wrong and how to fix it; a non-empty error marks the
control as invalid. Set `invalid` without an error only when the message is shown
elsewhere.

### Required, disabled, and read-only

`required` adds an indicator to the label and the native `required` attribute to
the control. `disabled` and `readOnly` apply to the control inside the field. A
`Fieldset` can disable all of its fields at once.

### Other controls

`Field` provides context to `FieldInput` and `FieldTextarea`. Checkbox and Combobox
also read it, but they accept their own `label`, `helperText`, and `error` props, so
you rarely need to wrap them.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/field/field.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Field

Field forwards native div attributes to its wrapper.

| Prop          | Type      | Default     | Description                                                     |
| ------------- | --------- | ----------- | --------------------------------------------------------------- |
| `label`       | `string`  | `Required`  | Visible label for the control.                                  |
| `labelHidden` | `boolean` | `false`     | Visually hides the label while keeping it accessible.           |
| `helperText`  | `string`  | `''`        | Supporting text below the control.                              |
| `error`       | `string`  | `''`        | Error message. A non-empty value marks the control invalid.     |
| `invalid`     | `boolean` | `!!error`   | Marks the control invalid without changing the message.         |
| `required`    | `boolean` | `false`     | Shows the required indicator and requires a value.              |
| `disabled`    | `boolean` | `false`     | Disables the control. Inherited from a disabled Fieldset.       |
| `readOnly`    | `boolean` | `false`     | Prevents edits while keeping the value focusable and submitted. |
| `id`          | `string`  | `Generated` | ID applied to the control. The label targets it.                |
| `children`    | `Snippet` | `—`         | The control, usually FieldInput or FieldTextarea.               |
| `class`       | `string`  | `—`         | Additional Tailwind classes on the wrapper.                     |

### FieldInput

FieldInput forwards native input attributes, including type, name, placeholder, and
event handlers.

| Prop    | Type                | Default | Description                               |
| ------- | ------------------- | ------- | ----------------------------------------- |
| `value` | `string (bindable)` | `—`     | The input value.                          |
| `type`  | `string`            | `text`  | Native input type.                        |
| `class` | `string`            | `—`     | Additional Tailwind classes on the input. |

### FieldTextarea

FieldTextarea forwards native textarea attributes.

| Prop    | Type                | Default | Description                                  |
| ------- | ------------------- | ------- | -------------------------------------------- |
| `value` | `string (bindable)` | `—`     | The textarea value.                          |
| `rows`  | `number`            | `3`     | Visible text lines.                          |
| `class` | `string`            | `—`     | Additional Tailwind classes on the textarea. |

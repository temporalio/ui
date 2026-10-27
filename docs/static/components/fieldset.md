# Fieldset

Group related form fields under a shared legend.

## Anatomy

A fieldset groups related fields under a legend.

- **Root** `[data-scope="fieldset"][data-part="root"]`: The native fieldset. Disables every control inside when disabled.
  - **Legend** `legend` (top): Names the group.
  - **Helper text** `[data-scope="fieldset"][data-part="helper-text"]` (right): Describes the group. Linked to the fieldset.
  - **Fields** `[data-scope="field"][data-part="root"]` (left): The Field components inside the group.
  - **Error text** `[data-scope="fieldset"][data-part="error-text"]` (bottom): Explains a problem that involves several fields.

## Examples

Use a fieldset for a set of fields that answer one question or configure one thing,
such as a retry policy. Disabling the fieldset disables every field inside it.

## Usage

### Import

```svelte
<script lang="ts">
  import { Field, FieldInput } from '$lib/io-ark/field';
  import { Fieldset } from '$lib/io-ark/fieldset';
</script>

<Fieldset legend="Retry policy" helperText="Applies to every activity.">
  <Field label="Initial interval">
    <FieldInput value="1s" />
  </Field>
  <Field label="Maximum attempts">
    <FieldInput type="number" value="5" />
  </Field>
</Fieldset>
```

Package consumers can import from `@temporalio/ui/io-ark/fieldset`.

### Legends

Write a short `legend` that names the group. Screen readers announce it before each
field in the group. Use `legendHidden` only when a nearby heading already names the
group.

### Group validation

Set `error` for problems that involve more than one field, such as a maximum
interval that is shorter than the initial interval. Keep field-specific messages on
the individual fields.

### Disabled groups

`disabled` uses the native fieldset behavior, so every control inside it is disabled
and skipped by keyboard navigation.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/fieldset/fieldset.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Fieldset

Fieldset forwards native fieldset attributes.

| Prop           | Type      | Default    | Description                                                     |
| -------------- | --------- | ---------- | --------------------------------------------------------------- |
| `legend`       | `string`  | `Required` | Visible name for the group.                                     |
| `legendHidden` | `boolean` | `false`    | Visually hides the legend while keeping it accessible.          |
| `helperText`   | `string`  | `''`       | Supporting text below the legend.                               |
| `error`        | `string`  | `''`       | Group error message. A non-empty value marks the group invalid. |
| `invalid`      | `boolean` | `!!error`  | Marks the group invalid without changing the message.           |
| `disabled`     | `boolean` | `false`    | Disables every control in the group.                            |
| `children`     | `Snippet` | `—`        | The fields in the group.                                        |
| `class`        | `string`  | `—`        | Additional Tailwind classes on the fieldset.                    |

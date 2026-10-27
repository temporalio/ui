# Steps

Guide people through a task that is split into ordered steps.

## Anatomy

Steps shows a list of numbered stages above the content for the current stage.

- **Root** `[data-scope="steps"][data-part="root"]`: The wrapper that tracks the current step.
  - **Trigger** `[data-part="item"]:nth-child(2) [data-part="trigger"]` (top): Moves to the step when navigation allows it.
    - **Indicator** `[data-part="item"]:first-child [data-part="indicator"]` (left): Shows the step number, or a check mark once complete.
  - **Separator** `[data-part="item"]:first-child [data-part="separator"]` (top): The line connecting the step to the next one.
  - **Content** `[data-part="content"]:not([hidden])` (left): The panel for the current step.
  - **Prev trigger** `prev-trigger` (bottom): Moves to the previous step.
  - **Next trigger** `next-trigger` (bottom): Moves to the next step.

## Examples

Use steps for multi-part setup flows such as creating a namespace. Each step shows its
number, a check mark once complete, and a ring on the current step.

## Usage

### Import

```svelte
<script lang="ts">
  import { Steps, type StepsItem } from '$lib/io-ark/steps';

  const items: StepsItem[] = [
    { title: 'Details' },
    { title: 'Retention' },
    { title: 'Review' },
  ];
  let step = $state(0);
</script>

<Steps {items} bind:step>
  {#snippet content(item)}
    <p>{item.title} settings</p>
  {/snippet}
  {#snippet completed()}
    <p>Namespace created.</p>
  {/snippet}
</Steps>
```

Package consumers can import from `@temporalio/ui/io-ark/steps`.

### Step state

`step` is the zero-based index of the current step. When it equals the number of
items, every step is complete and the `completed` snippet is shown.

### Linear flows

By default people can jump to any step by selecting its title. Set `linear` to require
steps in order, and pass `isStepValid` to block moving forward until the current step
is valid.

### Controls

Back and Next buttons appear below the content. Set `showControls` to false and bind
`step` when the surrounding form provides its own actions. Use `prevLabel` and
`nextLabel` to describe the action, such as "Create namespace" on the last step.

### When to use

Use steps when a task has three to six distinct parts that build on each other. Use
Tabs for independent views that people can visit in any order.

### Accessibility

Step titles are tabs that control their content panels. Arrow keys move between step
titles, and the current step is announced. Indicators are decorative; each title and
its state carry the meaning.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/steps/steps.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Steps

Steps forwards native div attributes to its root.

| Prop             | Type                           | Default      | Description                                                   |
| ---------------- | ------------------------------ | ------------ | ------------------------------------------------------------- |
| `items`          | `StepsItem[]`                  | `Required`   | Steps to show, in order.                                      |
| `step`           | `number (bindable)`            | `0`          | Zero-based index of the current step.                         |
| `orientation`    | `horizontal \| vertical`       | `horizontal` | Steps above the content, or beside it.                        |
| `linear`         | `boolean`                      | `false`      | Requires completing steps in order.                           |
| `isStepValid`    | `(index: number) => boolean`   | `—`          | Blocks moving past a step that is not valid.                  |
| `showControls`   | `boolean`                      | `true`       | Shows the Back and Next buttons.                              |
| `prevLabel`      | `string`                       | `Back`       | Label for the previous button.                                |
| `nextLabel`      | `string`                       | `Next`       | Label for the next button.                                    |
| `completedLabel` | `string`                       | `Completed`  | Screen reader text added after the title of a completed step. |
| `onStepChange`   | `(step: number) => void`       | `—`          | Called when the current step changes.                         |
| `onStepComplete` | `() => void`                   | `—`          | Called when the last step is completed.                       |
| `content`        | `Snippet<[StepsItem, number]>` | `—`          | Content for each step; receives the item and its index.       |
| `completed`      | `Snippet`                      | `—`          | Content shown after every step is complete.                   |
| `id`             | `string`                       | `Generated`  | Base for internal IDs.                                        |
| `class`          | `string`                       | `—`          | Additional Tailwind classes on the root.                      |
| `contentClass`   | `string`                       | `—`          | Additional Tailwind classes on each content panel.            |

### StepsItem

| Prop          | Type     | Default    | Description                         |
| ------------- | -------- | ---------- | ----------------------------------- |
| `title`       | `string` | `Required` | Step name shown next to its number. |
| `description` | `string` | `—`        | Short supporting text.              |

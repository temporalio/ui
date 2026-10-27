# Tour

Guide people through a new or changed interface one step at a time.

## Anatomy

Each tour step shows a popover next to its target, with the rest of the page dimmed.

- **Root**: Manages the steps and the current position.
  - **Spotlight** `spotlight` (left): Highlights the target element of the current step.
  - **Content** `content` (right): The step popover.
    - **Title** `title` (left): Names the step.
    - **Description** `description` (left): Explains the target.
    - **Close trigger** `close-trigger` (right): Ends the tour.
    - **Progress text** `progress-text` (bottom): Shows the current step, such as 2 of 3.
    - **Actions** `actions` (bottom): The Skip, Back, Next, and Finish buttons.

## Examples

Start a tour from a button. The first step is a centered introduction; the next
steps highlight parts of a workflow list with a spotlight and a popover beside them.

## Usage

### Import

```svelte
<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Tour, type TourStep } from '$lib/io-ark/tour';

  let open = $state(false);
  let filters = $state<HTMLElement | null>(null);

  const steps: TourStep[] = [
    {
      id: 'intro',
      title: 'Find workflows faster',
      description: 'Take a quick look at the new workflow list.',
    },
    {
      id: 'filters',
      title: 'Filter executions',
      description: 'Narrow the list by status, type, or start time.',
      target: () => filters,
    },
  ];
</script>

<div bind:this={filters}>…</div>
<Button onclick={() => (open = true)}>Start tour</Button>
<Tour {steps} bind:open />
```

Package consumers can import from `@temporalio/ui/io-ark/tour`.

### Steps

Each step needs an `id`, a `title`, and a `description`. Give a step a `target`
function that returns the element to highlight; the popover is placed beside it using
`placement`. Steps without a target appear as a centered dialog. Set `type` to
override this, and `backdrop={false}` to leave the page undimmed for a step.

### Starting and ending

Set `open` to true to start the tour from its first step. `open` returns to false when
the tour ends. `onComplete` is called when someone finishes the last step, `onSkip`
when they choose the skip action, and `onDismiss` when they close the tour early with
the close button or Escape.

### When to use

Use tours sparingly, for new or substantially changed workflows. Keep them short,
start them only when someone chooses to, and always let people skip. Prefer clear
labels, helper text, and empty states; a tour should not be the only way to learn how
something works.

### Keyboard and focus

When a step opens, focus moves into its popover. Tab moves between the step's
buttons. Press the Right and Left arrow keys to move to the next or previous step, and
Escape to close the tour. Each step is announced with its title and description. By
default, clicking outside the popover does not end the tour.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/tour/tour.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Tour

| Prop                     | Type                          | Default      | Description                                                  |
| ------------------------ | ----------------------------- | ------------ | ------------------------------------------------------------ |
| `steps`                  | `TourStep[]`                  | `Required`   | The steps, in order.                                         |
| `open`                   | `boolean (bindable)`          | `false`      | Set true to start the tour. Becomes false when it ends.      |
| `nextLabel`              | `string`                      | `Next`       | Label for the next action.                                   |
| `backLabel`              | `string`                      | `Back`       | Label for the previous action.                               |
| `finishLabel`            | `string`                      | `Finish`     | Label for the action on the last step.                       |
| `skipLabel`              | `string`                      | `Skip tour`  | Label for the skip action, shown on every step but the last. |
| `closeLabel`             | `string`                      | `Close tour` | Accessible label for the close button.                       |
| `showProgress`           | `boolean`                     | `true`       | Shows the step count, such as 2 of 4.                        |
| `closeOnEscape`          | `boolean`                     | `true`       | Closes the tour when Escape is pressed.                      |
| `closeOnInteractOutside` | `boolean`                     | `false`      | Closes the tour when someone clicks outside the popover.     |
| `keyboardNavigation`     | `boolean`                     | `true`       | Moves between steps with the arrow keys.                     |
| `spotlightRadius`        | `number`                      | `4`          | Corner radius of the spotlight, in pixels.                   |
| `onStepChange`           | `(stepIndex: number) => void` | `—`          | Called when the current step changes.                        |
| `onComplete`             | `() => void`                  | `—`          | Called when the last step is finished.                       |
| `onSkip`                 | `() => void`                  | `—`          | Called when the skip action is chosen.                       |
| `onDismiss`              | `() => void`                  | `—`          | Called when the tour is closed before the last step.         |
| `id`                     | `string`                      | `Generated`  | Base for the tour element IDs.                               |
| `class`                  | `string`                      | `—`          | Additional Tailwind classes on the popover.                  |

### TourStep

| Prop          | Type                        | Default                              | Description                                    |
| ------------- | --------------------------- | ------------------------------------ | ---------------------------------------------- |
| `id`          | `string`                    | `Required`                           | Unique identifier for the step.                |
| `title`       | `string`                    | `Required`                           | Heading and accessible name of the step.       |
| `description` | `string`                    | `Required`                           | Supporting text for the step.                  |
| `target`      | `() => HTMLElement \| null` | `—`                                  | Returns the element to highlight.              |
| `placement`   | `TourStepPlacement`         | `bottom, or center without a target` | Where the popover sits relative to the target. |
| `type`        | `tooltip \| dialog`         | `tooltip with a target`              | How the step is presented.                     |
| `backdrop`    | `boolean`                   | `true`                               | Dims the page behind the step.                 |

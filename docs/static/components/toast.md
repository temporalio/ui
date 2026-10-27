# Toast

Show brief, non-blocking feedback about the result of an action.

## Anatomy

The toaster places a stack of toasts in a corner of the page. Each toast summarizes one result.

- **Root** `[data-scope="toast"][data-part="root"]`: One toast, with a colored accent for its type.
  - **Icon** `[data-scope="toast"][data-part="root"] > svg` (left): Shows the toast type, such as success or error.
  - **Title** `title` (left): A short summary of what happened.
  - **Description** `description` (left): Optional details.
  - **Action trigger** `action-trigger` (bottom): An optional button that acts on the result. Toasts with an action stay until dismissed.
  - **Close trigger** `close-trigger` (right): Dismisses the toast.

## Examples

Use toasts to confirm that something happened, report a failure that does not need
an immediate decision, or track a request while it is in progress.

## Usage

### Import

```svelte
<script lang="ts">
  import { Button } from '$lib/io-poc/button';
  import { Toaster, toaster } from '$lib/io-poc/toast';
</script>

<Toaster />

<Button
  onclick={() =>
    toaster.create({
      type: 'success',
      title: 'Workflow started',
      description: 'order-fulfillment-7f3a is running.',
    })}
>
  Start workflow
</Button>
```

Package consumers can import from `@temporalio/ui/io-poc/toast`.

### Toaster setup

Render one `Toaster` near the root of the app and call methods on the shared
`toaster` from anywhere. Use `createIoToaster` when part of the app needs its own
placement or limits, and pass that instance to its own `Toaster`.

### Types

Set `type` to `info`, `success`, `warning`, `error`, or `loading`. Each type has its
own icon and accent color. Write a short title that states the outcome, and add a
description only when it helps people decide what to do next.

### Actions

Add one `action` for a follow-up, such as viewing the workflow that just started.
A toast with an action stays until someone uses the action or closes it, so people have
time to reach it. Set `duration` to let it close on a timer anyway. Never put the only
way to complete a task in a toast.

### Promises

`toaster.promise` shows a loading toast and replaces it with a success or error toast
when the promise settles. Use it for requests that usually finish within a few seconds.

### Accessibility

Toasts are announced by screen readers from a labelled region. Hovering, focusing, or
switching away from the page pauses the timer. Press F8 to move focus to the toasts,
and Escape to dismiss the focused toast. Give important errors a longer `duration`, or
set `duration: Infinity` so they stay until dismissed.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/toast/toast.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Toaster

| Prop         | Type        | Default                | Description                                |
| ------------ | ----------- | ---------------------- | ------------------------------------------ |
| `toaster`    | `IoToaster` | `toaster`              | The toaster instance to render.            |
| `label`      | `string`    | `Notifications`        | Accessible name of the toast region.       |
| `closeLabel` | `string`    | `Dismiss notification` | Accessible label for each close button.    |
| `class`      | `string`    | `—`                    | Additional Tailwind classes on each toast. |

### createIoToaster

Options passed to `createIoToaster(options)`. The shared `toaster` uses the defaults.

| Prop              | Type                                                                  | Default      | Description                                         |
| ----------------- | --------------------------------------------------------------------- | ------------ | --------------------------------------------------- |
| `placement`       | `top-start \| top \| top-end \| bottom-start \| bottom \| bottom-end` | `bottom-end` | Where toasts appear.                                |
| `max`             | `number`                                                              | `5`          | Maximum number of visible toasts.                   |
| `duration`        | `number`                                                              | `5000`       | Default time in milliseconds before a toast closes. |
| `gap`             | `number`                                                              | `12`         | Space in pixels between toasts.                     |
| `overlap`         | `boolean`                                                             | `false`      | Stacks toasts on top of each other.                 |
| `pauseOnPageIdle` | `boolean`                                                             | `true`       | Pauses timers while the page is hidden.             |

### Toast options

Options passed to `toaster.create(options)`.

| Prop          | Type                                             | Default     | Description                                                                                |
| ------------- | ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------ |
| `title`       | `string`                                         | `—`         | The outcome, in a few words.                                                               |
| `description` | `string`                                         | `—`         | Supporting detail.                                                                         |
| `type`        | `info \| success \| warning \| error \| loading` | `info`      | Icon and accent color.                                                                     |
| `duration`    | `number`                                         | `5000`      | Time in milliseconds before the toast closes. Toasts with an action default to `Infinity`. |
| `action`      | `{ label: string; onClick: () => void }`         | `—`         | A single follow-up action. The toast stays until it is used or closed.                     |
| `closable`    | `boolean`                                        | `true`      | Shows the close button.                                                                    |
| `id`          | `string`                                         | `Generated` | Reuse an ID to update an existing toast.                                                   |

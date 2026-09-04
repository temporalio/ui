<script lang="ts" module>
  export type ChipStatusValue =
    | 'Running'
    | 'Paused'
    | 'Completed'
    | 'ContinuedAsNew'
    | 'Failed'
    | 'TimedOut'
    | 'Terminated'
    | 'Canceled';

  type ChipStatusColorScheme =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error';

  const sharedClasses =
    "relative inline-flex appearance-none items-stretch overflow-hidden whitespace-nowrap rounded-sm border p-0 font-mono text-xs leading-none uppercase before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-transparent before:content-[''] enabled:cursor-pointer enabled:hover:before:bg-surface-overlay-primary enabled:active:before:bg-surface-overlay-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:cursor-not-allowed disabled:opacity-disabled";
  const segmentClasses =
    'relative z-10 inline-flex flex-nowrap items-center justify-center gap-1 p-1';

  const colorSchemeClasses: Record<
    ChipStatusColorScheme,
    { chip: string; extension: string }
  > = {
    neutral: {
      chip: 'border-secondary bg-surface-neutral text-secondary',
      extension: 'bg-surface-overlay-secondary',
    },
    info: {
      chip: 'border-information bg-surface-information text-information',
      extension: 'bg-surface-overlay-information',
    },
    success: {
      chip: 'border-success bg-surface-success text-success',
      extension: 'bg-surface-overlay-success',
    },
    warning: {
      chip: 'border-warning bg-surface-warning text-warning',
      extension: 'bg-surface-overlay-warning',
    },
    danger: {
      chip: 'border-danger bg-surface-danger text-danger',
      extension: 'bg-surface-overlay-danger',
    },
    error: {
      chip: 'border-error bg-surface-error text-error',
      extension: 'bg-surface-overlay-error',
    },
  };

  const statusConfiguration: Record<
    ChipStatusValue,
    { text: string; colorScheme: ChipStatusColorScheme }
  > = {
    Running: { text: 'running', colorScheme: 'info' },
    Paused: { text: 'paused', colorScheme: 'info' },
    Completed: { text: 'complete', colorScheme: 'success' },
    ContinuedAsNew: { text: 'continued as new', colorScheme: 'success' },
    Failed: { text: 'failed', colorScheme: 'danger' },
    TimedOut: { text: 'timed out', colorScheme: 'error' },
    Terminated: { text: 'terminated', colorScheme: 'warning' },
    Canceled: { text: 'cancelled', colorScheme: 'neutral' },
  };
</script>

<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  interface Props extends Omit<
    HTMLButtonAttributes,
    'children' | 'class' | 'type'
  > {
    status: ChipStatusValue;
    text?: string;
    count?: string | number;
    extension?: string | number;
    class?: string;
    type?: HTMLButtonAttributes['type'];
  }

  let {
    status,
    text,
    count,
    extension,
    class: className,
    type = 'button',
    ...rest
  }: Props = $props();

  const configuration = $derived(statusConfiguration[status]);
  const label = $derived.by(() => {
    const statusText = text ?? configuration.text;

    if (typeof count === 'number') {
      return `${count.toLocaleString()} ${statusText}`;
    }
    if (count != null) return `${count} ${statusText}`;

    return statusText;
  });
</script>

<button
  {type}
  class={twMerge(
    sharedClasses,
    colorSchemeClasses[configuration.colorScheme].chip,
    className,
  )}
  {...rest}
>
  <span class="{segmentClasses} font-medium">{label}</span>
  {#if extension !== undefined}
    <span
      class={twMerge(
        segmentClasses,
        colorSchemeClasses[configuration.colorScheme].extension,
        'font-normal',
      )}
    >
      {#if typeof extension === 'number'}
        {extension.toLocaleString(undefined, { signDisplay: 'always' })}
      {:else}
        {extension}
      {/if}
    </span>
  {/if}
</button>

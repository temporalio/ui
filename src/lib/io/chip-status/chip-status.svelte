<script lang="ts" module>
  import {
    type ChipColorScheme,
    chipRecipe,
    chipSegmentRecipe,
  } from '$lib/io/chip';

  export type ChipStatusValue =
    | 'Running'
    | 'Paused'
    | 'Completed'
    | 'ContinuedAsNew'
    | 'Failed'
    | 'TimedOut'
    | 'Terminated'
    | 'Canceled';

  const statusConfiguration: Record<
    ChipStatusValue,
    { text: string; colorScheme: ChipColorScheme }
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
  class={chipRecipe({ colorScheme: configuration.colorScheme, className })}
  {...rest}
>
  <span class={chipSegmentRecipe({ colorScheme: configuration.colorScheme })}>
    <span>{label}</span>
  </span>
  {#if extension !== undefined}
    <span
      class={chipSegmentRecipe({
        colorScheme: configuration.colorScheme,
        isExtension: true,
      })}
    >
      <span>
        {#if typeof extension === 'number'}
          {extension.toLocaleString(undefined, { signDisplay: 'always' })}
        {:else}
          {extension}
        {/if}
      </span>
    </span>
  {/if}
</button>

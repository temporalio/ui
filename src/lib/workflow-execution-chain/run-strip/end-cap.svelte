<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import Tooltip from '$lib/holocene/tooltip.svelte';

  interface Props {
    side: 'start' | 'end';
    contentScrolledUnder: boolean;
    tooltip: string;
    label: string;
    disabled: boolean;
    busy?: boolean;
    onclick: () => void;
    children: Snippet;
  }

  let {
    side,
    contentScrolledUnder,
    tooltip,
    label,
    disabled,
    busy = false,
    onclick,
    children,
  }: Props = $props();

  const tooltipPosition = $derived(
    side === 'start' ? { top: true as const } : { topLeft: true as const },
  );
</script>

<div
  class={twMerge(
    'sticky z-30 flex w-9 shrink-0 bg-surface-primary',
    side === 'start' ? 'left-0' : 'right-0',
  )}
>
  <Tooltip text={tooltip} {...tooltipPosition} usePortal class="flex w-full">
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled ? 'true' : undefined}
      aria-busy={busy ? 'true' : undefined}
      {onclick}
      class="relative flex w-full items-center justify-center rounded border border-brand bg-surface-primary text-brand shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press aria-disabled:cursor-not-allowed aria-disabled:opacity-disabled aria-disabled:shadow-sm"
    >
      {@render children()}
    </button>
  </Tooltip>
  <span
    class={twMerge(
      'pointer-events-none absolute -bottom-1 -top-1 w-7 to-transparent opacity-0 transition-opacity',
      side === 'start'
        ? 'left-full bg-gradient-to-r from-[var(--color-surface-primary)]'
        : 'right-full bg-gradient-to-l from-[var(--color-surface-primary)]',
      contentScrolledUnder && 'opacity-100',
    )}
  ></span>
</div>

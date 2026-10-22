<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twJoin, twMerge } from 'tailwind-merge';

  import { type IconComponent, IconSpinner } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  const wrapperClasses = twJoin(
    'relative',
    'inline-flex',
    'shrink-0',
    'items-center',
    'justify-center',
    'gap-1',
    'whitespace-nowrap',
    'rounded',
    'px-1',
    'py-0.5',
    'font-sans',
    'font-medium',
    'text-xs',
    'leading-4',
    'cursor-pointer',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-interactive-primary-press',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background-primary',
    'disabled:cursor-not-allowed',
    'disabled:[&:not([aria-busy=true])]:opacity-disabled',
  );

  const unselectedClasses = twJoin(
    'bg-transparent text-secondary',
    '[&:not(:disabled)]:hover:bg-surface-overlay-primary',
    '[&:not(:disabled)[data-state=hover]]:bg-surface-overlay-primary',
    '[&:not(:disabled)]:active:bg-surface-overlay-secondary',
    '[&:not(:disabled)[data-state=active]]:bg-surface-overlay-secondary',
  );

  const selectedClasses = twJoin('bg-interactive-secondary-hover text-brand');

  export const segmentRecipe = ({
    selected,
    className,
  }: {
    selected: boolean;
    className?: string;
  }) =>
    twMerge(
      wrapperClasses,
      selected ? selectedClasses : unselectedClasses,
      className,
    );

  const countClasses = twJoin(
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'px-1',
    'py-0.5',
    'font-mono',
    'text-xs',
    'leading-none',
  );

  export const segmentCountRecipe = ({ selected }: { selected: boolean }) =>
    twJoin(
      countClasses,
      selected
        ? 'bg-interactive-secondary-hover text-brand'
        : 'bg-surface-overlay-tertiary text-secondary',
    );

  export interface SegmentProps extends Omit<HTMLButtonAttributes, 'class'> {
    selected?: boolean;
    count?: number;
    Icon?: ConditionalValue<IconComponent>;
    isLoading?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  let {
    selected = false,
    count,
    Icon,
    isLoading,
    class: className,
    type = 'button',
    children,
    ...rest
  }: SegmentProps = $props();
</script>

<button
  aria-busy={isLoading}
  {...rest}
  {type}
  data-selected={selected}
  class={segmentRecipe({ selected, className })}
>
  {#if isLoading}
    <IconSpinner class="animate-spin" width={12} height={12} />
  {:else if Icon}
    <Icon width={12} height={12} />
  {/if}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {#if count != null}
    <span data-segment-count class={segmentCountRecipe({ selected })}
      >{count}</span
    >
  {/if}
</button>

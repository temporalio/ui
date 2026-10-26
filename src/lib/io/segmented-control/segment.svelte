<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twJoin, twMerge } from 'tailwind-merge';

  import { type IconComponent, IconSpinner } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  const wrapperClasses = twJoin(
    'group',
    'relative',
    'inline-flex',
    'shrink-0',
    'items-center',
    'justify-center',
    'gap-1',
    'whitespace-nowrap',
    'rounded',
    'border',
    'border-transparent',
    'px-[3px]',
    'py-px',
    'font-sans',
    'font-medium',
    'text-xs',
    'leading-4',
    'cursor-pointer',
    'focus-visible:outline-none',
    'focus-visible:shadow-sm',
    'focus-visible:ring-2',
    'focus-visible:ring-indigo-9',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background-primary',
    '[&[data-state=focus]]:shadow-sm',
    '[&[data-state=focus]]:ring-2',
    '[&[data-state=focus]]:ring-indigo-9',
    '[&[data-state=focus]]:ring-offset-2',
    '[&[data-state=focus]]:ring-offset-background-primary',
    'disabled:cursor-not-allowed',
    'disabled:[&:not([aria-busy=true])]:opacity-disabled',
  );

  const unselectedClasses = twJoin(
    'bg-transparent text-secondary',
    '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-tertiary-hover',
    '[&:not(:disabled)]:focus-visible:bg-interactive-tertiary-hover',
    '[&:not(:disabled)[data-state=focus]]:bg-interactive-tertiary-hover',
  );

  const selectedClasses = twJoin(
    'bg-interactive-secondary-hover text-brand',
    '[&:not(:disabled)]:hover:border-brand',
    '[&:not(:disabled)]:hover:bg-interactive-primary-hover',
    '[&:not(:disabled)]:hover:text-white',
    '[&:not(:disabled)[data-state=hover]]:border-brand',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-primary-hover',
    '[&:not(:disabled)[data-state=hover]]:text-white',
  );

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
      'bg-surface-overlay-tertiary',
      selected
        ? twJoin(
            'text-brand',
            '[.group:not(:disabled):hover_&]:bg-surface-overlay-neutral',
            '[.group:not(:disabled):hover_&]:text-white',
            '[.group:not(:disabled)[data-state=hover]_&]:bg-surface-overlay-neutral',
            '[.group:not(:disabled)[data-state=hover]_&]:text-white',
          )
        : 'text-secondary',
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

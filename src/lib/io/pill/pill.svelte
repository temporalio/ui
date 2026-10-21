<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twJoin, twMerge } from 'tailwind-merge';

  import BadgeCount from '$lib/io/badge-count/badge-count.svelte';
  import { type IconComponent, IconSpinner } from '$lib/io/icon';
  import type { ConditionalValue } from '$lib/io/types';

  const wrapperClasses = twJoin(
    'relative',
    'inline-flex',
    'shrink-0',
    'items-center',
    'justify-center',
    'gap-2',
    'whitespace-nowrap',
    'rounded-full',
    'px-3',
    'py-1',
    'font-sans',
    'text-sm',
    'cursor-pointer',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-interactive-primary-press',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background-primary',
    'disabled:cursor-not-allowed',
    'disabled:[&:not([aria-busy=true])]:opacity-disabled',
  );

  const inactiveClasses = twJoin(
    'bg-transparent text-primary',
    '[&:not(:disabled)]:hover:bg-interactive-tertiary-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-tertiary-hover',
    '[&:not(:disabled)]:active:bg-interactive-tertiary-press',
    '[&:not(:disabled)[data-state=active]]:bg-interactive-tertiary-press',
  );

  const activeClasses = twJoin(
    'bg-interactive-primary text-white',
    '[&:not(:disabled)]:hover:bg-interactive-primary-hover',
    '[&:not(:disabled)[data-state=hover]]:bg-interactive-primary-hover',
    '[&:not(:disabled)]:active:bg-interactive-primary-press',
    '[&:not(:disabled)[data-state=active]]:bg-interactive-primary-press',
  );

  export const pillRecipe = ({
    active,
    className,
  }: {
    active: boolean;
    className?: string;
  }) =>
    twMerge(
      wrapperClasses,
      active ? activeClasses : inactiveClasses,
      className,
    );

  export interface PillProps extends Omit<HTMLButtonAttributes, 'class'> {
    active?: boolean;
    count?: number;
    Icon?: ConditionalValue<IconComponent>;
    isLoading?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  let {
    active = false,
    count,
    Icon,
    isLoading,
    class: className,
    type = 'button',
    children,
    ...rest
  }: PillProps = $props();
</script>

<button
  aria-busy={isLoading}
  {...rest}
  {type}
  data-active={active}
  class={pillRecipe({ active, className })}
>
  {#if isLoading}
    <IconSpinner class="animate-spin" width={16} height={16} />
  {:else if Icon}
    <Icon width={16} height={16} />
  {/if}
  {#if children}
    <span class="contents">{@render children()}</span>
  {/if}
  {#if count != null}
    <BadgeCount value={count} />
  {/if}
</button>

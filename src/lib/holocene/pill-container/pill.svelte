<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { noop } from 'svelte/internal';

  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { isNull } from '$lib/utilities/is';

  import { PILLS, type PillsContext } from './pill-container.svelte';

  type $$Props = {
    id: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    active?: boolean;
    icon?: IconName;
    count?: number;
    class?: string;
  } & HTMLButtonAttributes;

  export let id: string;
  export let onClick: () => void = noop;
  export let disabled = false;
  export let loading = false;
  export let active: boolean = null;
  export let icon: IconName = null;
  export let count: number = null;
  let className = '';
  export { className as class };

  const { activePill, registerPill, selectPill } =
    getContext<PillsContext>(PILLS);

  registerPill(id);

  $: isActive = isNull(active) ? $activePill === id : active;

  const handleClick = () => {
    if (disabled) return;
    selectPill(id);
    onClick && onClick();
  };
</script>

<button
  on:click|stopPropagation={handleClick}
  class={merge(
    'surface-subtle flex items-center justify-center gap-2 rounded-full px-3 py-1 text-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
    isActive && 'bg-interactive text-white',
    className,
  )}
  {disabled}
>
  {#if icon}
    <span class:animate-spin={loading}>
      <Icon name={loading ? 'spinner' : icon} />
    </span>
  {/if}
  <slot />
  {#if !isNull(count)}
    <Badge type="count">{count}</Badge>
  {/if}
</button>

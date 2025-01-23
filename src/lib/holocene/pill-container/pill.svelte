<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { isNull } from '$lib/utilities/is';

  import { PILLS, type PillsContext } from './pill-container.svelte';

  interface Props extends HTMLButtonAttributes {
    id: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    active?: boolean;
    icon?: IconName;
    count?: number;
    class?: string;
  }

  let {
    id,
    onClick = () => {},
    disabled = false,
    loading = false,
    active = null,
    icon = null,
    count = null,
    class: className = '',
    children,
  }: Props = $props();

  const { activePill, registerPill, selectPill } =
    getContext<PillsContext>(PILLS);

  registerPill(id);

  let isActive = $derived(isNull(active) ? $activePill === id : active);

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    selectPill(id);
    onClick && onClick();
  };
</script>

<button
  onclick={handleClick}
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
  {@render children?.()}
  {#if !isNull(count)}
    <Badge type="count">{count}</Badge>
  {/if}
</button>

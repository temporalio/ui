<script lang="ts">
  import type {
    HTMLButtonAttributes,
    MouseEventHandler,
  } from 'svelte/elements';

  import { getContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { PILLS, type PillsContext } from './pill-container.svelte';

  type Props = HTMLButtonAttributes & {
    id: string;
    disabled?: boolean;
    loading?: boolean;
    active?: boolean;
    icon?: IconName;
    count?: number;
    class?: string;
    children?: Snippet;
  };

  const {
    id,
    onclick,
    disabled = false,
    loading = false,
    active = undefined,
    icon = undefined,
    count = undefined,
    class: className = '',
    children,
    ...buttonProps
  }: Props = $props();

  const { activePill, registerPill, selectPill } =
    getContext<PillsContext>(PILLS);

  // svelte-ignore state_referenced_locally
  registerPill(id, disabled);

  let isActive = $derived(active == null ? $activePill === id : active);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) {
      return;
    }

    selectPill(id);
    onclick?.(e);
  };
</script>

<button
  {...buttonProps}
  onclick={(e) => {
    e.stopPropagation();
    handleClick(e);
  }}
  class={merge(
    'flex items-center justify-center gap-2 rounded-full px-3 py-1 text-sm',
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
  {#if count != null}
    <Badge type="count">{count}</Badge>
  {/if}
</button>

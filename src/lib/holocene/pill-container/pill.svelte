<script lang="ts">
  import type {
    HTMLButtonAttributes,
    MouseEventHandler,
  } from 'svelte/elements';

  import { getContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import { type IconComponent, IconSpinner } from '$lib/io/icon';

  import { PILLS, type PillsContext } from './pill-container.svelte';

  type Props = HTMLButtonAttributes & {
    id: string;
    disabled?: boolean;
    loading?: boolean;
    active?: boolean;
    Icon?: IconComponent;
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
    Icon,
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

  const Glyph = $derived(loading ? IconSpinner : Icon);
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
  {#if Icon}
    <span class:animate-spin={loading}>
      <Glyph />
    </span>
  {/if}
  {@render children?.()}
  {#if count != null}
    <Badge type="count">{count}</Badge>
  {/if}
</button>

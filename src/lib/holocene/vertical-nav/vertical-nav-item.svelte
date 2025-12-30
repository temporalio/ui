<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { getContext, onDestroy, onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon';

  import { VERTICAL_NAV, type VerticalNavContext } from './vertical-nav.svelte';

  interface Props extends HTMLAttributes<HTMLAnchorElement> {
    label: string;
    id: string;
    href: string;
    leadingIcon?: IconName;
    trailingIcon?: IconName;
    description?: string;
    active?: boolean;
    disabled?: boolean;
    class?: string;
    'data-testid'?: string;
  }

  let {
    label,
    id,
    href,
    leadingIcon = null,
    trailingIcon = null,
    description = null,
    active = null,
    disabled = false,
    class: className = '',
    'data-testid': dataTestId,
    ...restProps
  }: Props = $props();

  let itemElement = $state<HTMLAnchorElement>();

  const context = getContext<VerticalNavContext>(VERTICAL_NAV);
  const activeItem = $derived(context?.activeItem);
  const isActive = $derived(active !== null ? active : $activeItem === id);

  const handleClick = () => {
    if (disabled) return;
    context?.selectItem(id);
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      context?.setHoveredItem(id);
    }
  };

  const handleMouseLeave = () => {
    context?.setHoveredItem(null);
  };

  onMount(() => {
    if (itemElement) {
      context?.registerItem(id, itemElement);
    }
  });

  onDestroy(() => {
    context?.unregisterItem(id);
  });
</script>

<li>
  <a
    bind:this={itemElement}
    {href}
    {id}
    role="menuitem"
    aria-current={isActive ? 'page' : undefined}
    aria-disabled={disabled}
    data-testid={dataTestId ?? id}
    data-track-name="vertical-nav-item"
    data-track-intent="navigate"
    data-track-text={label}
    class={merge(
      'group relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
      isActive && 'text-primary',
      !isActive && 'text-secondary hover:text-primary',
      disabled && 'cursor-not-allowed opacity-50 hover:text-secondary',
      className,
    )}
    onclick={handleClick}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    {...restProps}
  >
    {#if leadingIcon}
      <Icon name={leadingIcon} class="size-4 flex-shrink-0" />
    {/if}

    <div class="flex flex-1 flex-col">
      <span>{label}</span>
      {#if description}
        <span class="text-xs text-secondary">{description}</span>
      {/if}
    </div>

    {#if trailingIcon}
      <Icon name={trailingIcon} class="size-4 flex-shrink-0" />
    {/if}
  </a>
</li>

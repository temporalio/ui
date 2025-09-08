<script lang="ts">
  import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { isNull } from '$lib/utilities/is';

  import { type TabContext, TABS } from './tabs.svelte';

  type OwnProps = {
    label: string;
    id: string;
    'data-testid'?: string;
    href?: string;
    panelId?: string;
    disabled?: boolean;
    active?: boolean;
    onClick?: () => void;
    children?: Snippet;
  };

  type Props =
    | (OwnProps & HTMLButtonAttributes)
    | (OwnProps & HTMLAttributes<HTMLAnchorElement>);

  let {
    label,
    id,
    href = null,
    panelId = null,
    disabled = false,
    active = null,
    onClick = () => {},
    children,
    'data-testid': dataTestId,
    ...restProps
  }: Props = $props();

  const { registerTab, selectTab, activeTab } = getContext<TabContext>(TABS);

  registerTab(id);

  const isActive = $derived(isNull(active) ? $activeTab === id : active);

  const handleClick = () => {
    if (disabled) return;
    selectTab(id);
    onClick && onClick();
  };
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  type={href ? undefined : 'button'}
  role="tab"
  class={merge(
    'flex cursor-pointer items-center gap-1 whitespace-nowrap border-b border-transparent text-sm font-medium leading-8 outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
    isActive && 'border-brand text-brand',
    disabled && 'cursor-not-allowed opacity-50',
    !disabled && 'hover:text-brand',
  )}
  aria-selected={isActive}
  aria-controls={panelId}
  tabindex={isActive ? 0 : -1}
  {id}
  {href}
  data-testid={id ?? dataTestId}
  data-track-name="tab"
  data-track-intent="select"
  data-track-text={label}
  onclick={handleClick}
  {...restProps}
>
  {label}
  {@render children?.()}
</svelte:element>

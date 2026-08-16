<script lang="ts">
  import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

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
    class?: string;
  };

  type Props =
    | (OwnProps & HTMLButtonAttributes)
    | (OwnProps & HTMLAttributes<HTMLAnchorElement>);

  let {
    label,
    id,
    href = undefined,
    panelId = undefined,
    disabled = false,
    active = undefined,
    onClick = () => {},
    children,
    'data-testid': dataTestId,
    class: className,
    ...restProps
  }: Props = $props();

  const { registerTab, selectTab, activeTab } = getContext<TabContext>(TABS);

  let tabElement = $state<HTMLElement>();

  registerTab(id);

  const isActive = $derived(active == null ? $activeTab === id : active);

  const handleClick = () => {
    if (disabled) return;
    selectTab(id);
    onClick();
  };

  $effect(function keepActiveTabVisible() {
    if (!isActive || !tabElement) return;

    const tabList = tabElement.closest<HTMLElement>('[role="tablist"]');
    if (!tabList) return;

    requestAnimationFrame(() => {
      if (!tabElement || !tabList) return;

      const tabStart = tabElement.offsetLeft;
      const tabEnd = tabStart + tabElement.offsetWidth;
      const visibleStart = tabList.scrollLeft;
      const visibleEnd = visibleStart + tabList.clientWidth;

      if (tabStart < visibleStart) {
        tabList.scrollLeft = tabStart;
      } else if (tabEnd > visibleEnd) {
        tabList.scrollLeft = tabEnd - tabList.clientWidth;
      }
    });
  });
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  type={href ? undefined : 'button'}
  role="tab"
  bind:this={tabElement}
  class={merge(
    'mb-[-1px] flex h-control-sm shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap border-b-2 border-transparent px-0.5 text-xs font-medium outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
    className,
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

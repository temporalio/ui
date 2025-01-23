<script lang="ts">
  import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

  import { getContext } from 'svelte';

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
    ...rest
  }: Props = $props();

  const { registerTab, selectTab, activeTab } = getContext<TabContext>(TABS);

  registerTab(id);

  let isActive = $derived(isNull(active) ? $activeTab === id : active);

  const handleClick = () => {
    if (disabled) return;
    selectTab(id);
    onClick && onClick();
  };
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  role="tab"
  class="tab"
  aria-selected={isActive}
  aria-controls={panelId}
  tabindex={isActive ? 0 : -1}
  {id}
  {href}
  class:active={isActive}
  class:disabled
  data-testid={id ?? rest['data-testid']}
  onclick={handleClick}
  {...rest}
>
  {label}
  {@render children?.()}
</svelte:element>

<style lang="postcss">
  .tab {
    @apply flex cursor-pointer items-center gap-1 whitespace-nowrap border-b border-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary/70;

    &:not(.disabled) {
      @apply hover:text-brand;
    }
  }

  .tab.active {
    @apply border-brand;
  }

  .tab.disabled {
    @apply cursor-not-allowed opacity-50;
  }
</style>

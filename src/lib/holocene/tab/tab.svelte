<script lang="ts">
  import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import { noop } from 'svelte/internal';

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

  type $$Props =
    | (OwnProps & HTMLButtonAttributes)
    | (OwnProps & HTMLAttributes<HTMLAnchorElement>);

  export let label: string;
  export let id: string;
  export let href: string = null;
  export let panelId: string = null;
  export let disabled = false;
  export let active: boolean = null;
  export let onClick: () => void = noop;

  const { registerTab, selectTab, activeTab } = getContext<TabContext>(TABS);

  registerTab(id);

  $: isActive = isNull(active) ? $activeTab === id : active;

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
  data-testid={id ?? $$props['data-testid']}
  on:click={handleClick}
  {...$$restProps}
>
  {label}
  <slot />
</svelte:element>

<style lang="postcss">
  .tab {
    @apply flex cursor-pointer items-center gap-1 whitespace-nowrap border-b-2 border-transparent text-sm font-medium outline-none focus-visible:rounded-sm focus-visible:ring-4 focus-visible:ring-primary/70;

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

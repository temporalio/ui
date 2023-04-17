<script lang="ts">
  import { goto } from '$app/navigation';
  import { getContext } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { type TabContext, TABS } from './tabs.svelte';

  interface $$Props extends HTMLButtonAttributes {
    label: string;
    id: string;
    'data-testid'?: string;
    href?: string;
    panelId?: string;
    disabled?: boolean;
    active?: boolean;
  }

  export let label: string;
  export let id: string;
  export let href = '';
  export let panelId = null;
  export let disabled = false;
  export let active = false;

  const { registerTab, selectTab, activeTab } = getContext<TabContext>(TABS);

  registerTab(id);

  $: isActive = href ? active : $activeTab === id;

  const handleClick = () => {
    selectTab(id);
    if (href) goto(href);
  };
</script>

<button
  role="tab"
  class="tab"
  aria-selected={isActive}
  aria-controls={panelId}
  tabindex={isActive ? 0 : -1}
  {id}
  class:active={isActive}
  class:disabled
  data-testid={id ?? $$props['data-testid']}
  on:click={handleClick}
  {...$$restProps}
>
  {label}
  <slot />
</button>

<style lang="postcss">
  .tab {
    @apply cursor-pointer flex items-center gap-1 whitespace-nowrap border-b-2 text-sm hover:border-b-2 hover:border-blue-700 md:text-base;

    border-color: transparent;
  }

  button.active {
    @apply border-b-2 border-blue-700 font-medium text-blue-700;
  }

  button.disabled {
    @apply cursor-not-allowed text-gray-800 opacity-50;
  }

  button.disabled:hover {
    border-color: transparent;
  }
</style>

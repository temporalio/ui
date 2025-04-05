<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { getContext } from 'svelte';

  import { type TabContext, TABS } from './tabs.svelte';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    id: string;
    tabId: string;
  }

  export let id: string;
  export let tabId: string;
  const { registerPanel, activePanel } = getContext<TabContext>(TABS);
  $: active = $activePanel === id;
  registerPanel(id);
</script>

<div
  {id}
  class:hidden={!active}
  class:text-primary={active}
  aria-labelledby={tabId}
  tabindex="0"
  role="tabpanel"
  {...$$restProps}
>
  <slot />
</div>

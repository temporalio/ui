<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { getContext } from 'svelte';

  import { type TabContext, TABS } from './tabs.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    id: string;
    tabId: string;
  }

  let { id, tabId, children, ...rest }: Props = $props();
  const { registerPanel, activePanel } = getContext<TabContext>(TABS);
  let active = $derived($activePanel === id);
  registerPanel(id);
</script>

<div
  {id}
  class:hidden={!active}
  class:text-primary={active}
  aria-labelledby={tabId}
  tabindex="0"
  role="tabpanel"
  {...rest}
>
  {@render children?.()}
</div>

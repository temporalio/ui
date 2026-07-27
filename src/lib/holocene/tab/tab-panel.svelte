<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';

  import { type TabContext, TABS } from './tabs.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    id: string;
    tabId: string;
    children?: Snippet;
  }

  let { id, tabId, children, ...rest }: Props = $props();
  const { registerPanel, activePanel } = getContext<TabContext>(TABS);
  const initialId = id;
  const active = $derived($activePanel === initialId);
  registerPanel(initialId);
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

<script lang="ts">
  import type { TabsActivation, TabsOrientation } from './context';

  import TabBar from './tab-bar.svelte';
  import TabPanel from './tab-panel.svelte';
  import Tabs from './tabs.svelte';

  interface Props {
    tabs: string[];
    selectedTab?: string;
    disabledTabs?: string[];
    orientation?: TabsOrientation;
    activation?: TabsActivation;
    element?: 'button' | 'div';
    keepMounted?: boolean;
    onSelectedTabChange?: (tab: string) => void;
  }

  let {
    tabs,
    selectedTab = $bindable(tabs[0]),
    disabledTabs = [],
    orientation,
    activation,
    element = 'button',
    keepMounted,
    onSelectedTabChange,
  }: Props = $props();
</script>

<Tabs
  {tabs}
  bind:selectedTab
  {orientation}
  {activation}
  isTabDisabled={(tab) => disabledTabs.includes(tab)}
  {onSelectedTabChange}
>
  <TabBar aria-label="Example tabs">
    {#snippet tabSnippet({ tab, getAttributes })}
      {#if element === 'button'}
        <button type="button" {...getAttributes()}>{tab}</button>
      {:else}
        <div {...getAttributes()}>{tab}</div>
      {/if}
    {/snippet}
  </TabBar>
  {#each tabs as tab (tab)}
    <TabPanel {tab} {keepMounted} data-testid="panel-{tab}">
      {tab} content
    </TabPanel>
  {/each}
</Tabs>
<button type="button">Outside</button>

<script lang="ts">
  import TabBar from './tab-bar.svelte';
  import TabPanel from './tab-panel.svelte';
  import Tab from './tab.svelte';
  import Tabs from './tabs.svelte';

  interface Props {
    tabs: string[];
    selectedTab?: string;
  }

  let { tabs, selectedTab = $bindable() }: Props = $props();
</script>

{#if selectedTab === undefined}
  <Tabs {tabs}>{@render content()}</Tabs>
{:else}
  <Tabs {tabs} bind:selectedTab>{@render content()}</Tabs>
{/if}
<output data-testid="bound">{selectedTab}</output>

{#snippet content()}
  <TabBar aria-label="Example tabs">
    {#snippet tabSnippet({ tab, getAttributes })}
      <Tab {...getAttributes()}>{tab}</Tab>
    {/snippet}
  </TabBar>
  {#each tabs as tab (tab)}
    <TabPanel {tab}>{tab} content</TabPanel>
  {/each}
{/snippet}

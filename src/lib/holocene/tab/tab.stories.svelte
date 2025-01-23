<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import TabList from './tab-list.svelte';
  import TabPanel from './tab-panel.svelte';
  import Tab from './tab.svelte';
  import Tabs from './tabs.svelte';

  const { Story } = defineMeta({
    title: 'Tabs',
    component: Tabs,
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <Tabs {...args}>
    <TabList label="tabs">
      <Tab id="tab-a" panelId="tab-panel-a" label="Tab A" />
      <Tab id="tab-b" panelId="tab-panel-b" label="Tab B" />
      <Tab id="tab-c" panelId="tab-panel-c" label="Tab C" />
    </TabList>
    <TabPanel id="tab-panel-a" tabId="tab-a">
      <p class="py-4">Tab A Content</p>
    </TabPanel>
    <TabPanel id="tab-panel-b" tabId="tab-b">
      <p class="py-4">Tab B Content</p>
    </TabPanel>
    <TabPanel id="tab-panel-c" tabId="tab-c">
      <p class="py-4">Tab C Content</p>
    </TabPanel>
  </Tabs>
{/snippet}

<Story name="Default" />

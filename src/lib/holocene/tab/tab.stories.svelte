<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import TabList from './tab-list.svelte';
  import TabPanel from './tab-panel.svelte';
  import Tab from './tab.svelte';
  import Tabs from './tabs.svelte';

  export const meta = {
    title: 'Tabs',
    component: Tabs,
    subcomponents: { TabList, TabPanel, Tab },
    argTypes: {
      TABS: {
        name: 'Tabs',
        table: {
          disable: true,
        },
      },
    },
  } satisfies Meta<Omit<Tabs, 'TABS'>>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
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
</Template>

<Story name="Default" />

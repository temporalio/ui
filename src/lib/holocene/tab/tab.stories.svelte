<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import TabList from './tab-list.svelte';
  import TabPanel from './tab-panel.svelte';
  import Tab from './tab.svelte';
  import Tabs from './tabs.svelte';
</script>

<Meta title="Tab" component={Tab} />

<Story name="tab">
  <Tabs>
    <TabList label="Tabs">
      <Tab id="tab-a" panelId="tab-panel-a" label="Tab A" />
      <Tab id="tab-b" panelId="tab-panel-b" label="Tab B" />
      <Tab id="tab-c" panelId="tab-panel-c" label="Tab C" />
    </TabList>
    <TabPanel id="tab-panel-a" tabId="tab-a">Tab A Content</TabPanel>
    <TabPanel id="tab-panel-b" tabId="tab-b">Tab B Content</TabPanel>
    <TabPanel id="tab-panel-c" tabId="tab-c">Tab C Content</TabPanel>
  </Tabs>
</Story>

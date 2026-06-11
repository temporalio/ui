<script lang="ts">
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributesSchema } from '$lib/stores/search-attributes';

  interface Props {
    scheduleSearchAttributes: SearchAttributesSchema;
    workflowSearchAttributes: SearchAttributesSchema;
  }

  let {
    scheduleSearchAttributes = $bindable([]),
    workflowSearchAttributes = $bindable([]),
  }: Props = $props();
</script>

<Tabs>
  <h2 class="mb-4 mt-12">Search Attributes</h2>
  <TabList
    label={translate('schedules.add-schedule-attr')}
    class="flex flex-wrap gap-6"
  >
    <Tab
      label="Schedule"
      id="schedule-tab"
      data-testid="schedule-tab"
      panelId="schedule-panel"
    />
    <Tab
      label="Workflows"
      id="workflows-tab"
      data-testid="workflows-tab"
      panelId="workflows-panel"
    />
  </TabList>

  <div class="mt-4 flex w-full flex-wrap gap-6">
    <TabPanel
      id="schedule-panel"
      tabId="schedule-tab"
      class="w-full"
      data-testid="schedule-panel"
    >
      <AddSearchAttributes
        bind:attributesToAdd={scheduleSearchAttributes}
        class="w-full"
      />
    </TabPanel>

    <TabPanel
      id="workflows-panel"
      tabId="workflows-tab"
      class="w-full"
      data-testid="workflows-panel"
    >
      <AddSearchAttributes
        bind:attributesToAdd={workflowSearchAttributes}
        class="w-full"
      />
    </TabPanel>
  </div>
</Tabs>

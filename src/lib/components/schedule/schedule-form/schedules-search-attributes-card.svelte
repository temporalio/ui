<script lang="ts">
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import Card from '$lib/holocene/card.svelte';
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

<Card class="w-full">
  <Tabs class="flex flex-col gap-4">
    <h2 class="text-2xl font-medium">Search Attributes</h2>
    <TabList
      label={translate('schedules.add-schedule-attr')}
      class="flex flex-wrap gap-4 text-secondary"
    >
      <Tab
        label="Schedule"
        id="schedule-tab"
        data-testid="schedule-tab"
        panelId="schedule-panel"
        class="px-1"
      />
      <Tab
        label="Workflows"
        id="workflows-tab"
        data-testid="workflows-tab"
        panelId="workflows-panel"
        class="px-1"
      />
    </TabList>

    <div class="flex w-full flex-wrap gap-4">
      <TabPanel
        id="schedule-panel"
        tabId="schedule-tab"
        class="w-full"
        data-testid="schedule-panel"
      >
        <AddSearchAttributes
          variant="secondary"
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
          variant="secondary"
          bind:attributesToAdd={workflowSearchAttributes}
          class="w-full"
        />
      </TabPanel>
    </div>
  </Tabs>
</Card>

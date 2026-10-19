<script lang="ts">
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import Card from '$lib/holocene/card.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributesSchema } from '$lib/stores/search-attributes';

  import { scheduledActionTypes } from '../scheduled-action-types/registry';
  import type { ScheduledActionFormData } from '../scheduled-action-types/types';

  interface Props {
    scheduleSearchAttributes: SearchAttributesSchema;
    actionSearchAttributes: SearchAttributesSchema;
    actionType: ScheduledActionFormData['type'] | null;
  }

  let {
    scheduleSearchAttributes = $bindable([]),
    actionSearchAttributes = $bindable([]),
    actionType,
  }: Props = $props();

  const actionView = $derived(
    actionType ? scheduledActionTypes[actionType].searchAttributes : null,
  );
</script>

<Card class="w-full">
  <Tabs class="flex flex-col gap-4">
    <h2 class="text-2xl font-medium">
      {translate('schedules.search-attributes-title')}
    </h2>
    <TabList
      label={translate('schedules.add-schedule-attr')}
      class="flex flex-wrap gap-4 text-secondary"
    >
      <Tab
        label={translate('schedules.schedule')}
        id="schedule-tab"
        data-testid="schedule-tab"
        panelId="schedule-panel"
        class="px-1"
      />
      {#if actionView}
        <Tab
          label={actionView.label()}
          id={actionView.tabId}
          data-testid={actionView.tabId}
          panelId={actionView.panelId}
          class="px-1"
        />
      {/if}
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

      {#if actionView}
        <TabPanel
          id={actionView.panelId}
          tabId={actionView.tabId}
          class="w-full"
          data-testid={actionView.panelId}
        >
          {#key actionType}
            <actionView.View bind:attributes={actionSearchAttributes} />
          {/key}
        </TabPanel>
      {/if}
    </div>
  </Tabs>
</Card>

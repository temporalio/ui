<script lang="ts">
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import Card from '$lib/holocene/card.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributesSchema } from '$lib/stores/search-attributes';

  import { scheduledActionPresentations } from '../scheduled-action-types/presentation-registry';
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

  const presentation = $derived(
    actionType ? scheduledActionPresentations[actionType] : null,
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
      {#if presentation}
        <Tab
          label={presentation.form.searchAttributes.label()}
          id={presentation.form.searchAttributes.tabId}
          data-testid={presentation.form.searchAttributes.tabId}
          panelId={presentation.form.searchAttributes.panelId}
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

      {#if presentation}
        <TabPanel
          id={presentation.form.searchAttributes.panelId}
          tabId={presentation.form.searchAttributes.tabId}
          class="w-full"
          data-testid={presentation.form.searchAttributes.panelId}
        >
          {#key actionType}
            <presentation.form.searchAttributes.Component
              bind:attributes={actionSearchAttributes}
            />
          {/key}
        </TabPanel>
      {/if}
    </div>
  </Tabs>
</Card>

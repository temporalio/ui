<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow, events } = stuff as {
      workflow: WorkflowExecution;
      events: HistoryEventWithId[];
    };
    const { namespace } = page.params;

    return {
      props: {
        workflow,
        events,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import {
    faCode,
    faDownload,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import { eventTypeInCategory } from '$lib/utilities/get-event-categorization';

  import PendingActivities from './_pending-activities.svelte';
  import Event from './_event.svelte';
  import Option from '$lib/components/select/option.svelte';
  import Select from '$lib/components/select/select.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';

  export let workflow: WorkflowExecution;
  export let events: HistoryEventWithId[];

  let pendingActivities = workflow?.pendingActivities;
  let category: EventTypeCategory = null;

  $: visibleEvents = events.filter(eventTypeInCategory(category));
</script>

<div class="execution-information px-6 py-6">
  <div class="flex w-full mt-4">
    <PendingActivities activities={pendingActivities} />
  </div>
  <section>
    <h3 class="text-lg mb-2 font-semibold">Event History</h3>
    <nav class="flex gap-4 justify-between">
      <div class="w-36">
        <Select bind:value={category}>
          <Option value={null}>All</Option>
          <Option value="activity">Activity</Option>
          <Option value="command">Command</Option>
          <Option value="signal">Signal</Option>
          <Option value="timer">Timer</Option>
          <Option value="child-workflow">Child Workflow</Option>
          <Option value="workflow">Workflow</Option>
        </Select>
      </div>
      <div class="flex gap-4">
        <ToggleButtons>
          <ToggleButton icon={faStream} active />
          <ToggleButton icon={faLayerGroup} />
          <ToggleButton icon={faCode} />
        </ToggleButtons>
        <ToggleButton icon={faDownload} />
      </div>
    </nav>
    {#each visibleEvents as event (event.id)}
      <Event {event} />
    {/each}
  </section>
</div>

<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const {
      workflow: executionId,
      run: runId,
      namespace,
      activity,
    } = page.params;

    return {
      props: {
        executionId,
        runId,
        namespace,
        activity,
      },
    };
  }
</script>

<script lang="ts">
  import omit from 'lodash/omit';
  import { createEventStore } from '$lib/stores/events';

  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let namespace: string;
  export let executionId: string;
  export let runId: string;
  export let activity: string;

  const { activities } = createEventStore(namespace, executionId, runId);
  const selectedActivity = activities.getActivity(activity);

  $: events = Object.keys(omit($selectedActivity, ['id', 'status']));
</script>

<div class="p-4">
  <h1 class="font-bold text-3xl">Activity {$selectedActivity.id}</h1>
  <p>{$selectedActivity.status}</p>

  {#each events as event}
    <h2 class="mt-4 mb-2 border-indigo-400 border-b-2 font-semibold">
      {event}
    </h2>
    <KeyValueTable data={$selectedActivity[event]} />
  {/each}
</div>

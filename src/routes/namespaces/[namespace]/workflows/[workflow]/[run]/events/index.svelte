<script context="module" lang="ts">
  import type { GetWorkflowExecutionHistoryResponse } from '$types/temporal/api/workflowservice/v1/request_response';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ context }: LoadInput) {
    const { events } = context;

    return {
      props: {
        events,
      },
    };
  }
</script>

<script lang="ts">
  import Events from './_events.svelte';
  import EventsFilters from './_events-filters.svelte';

  export let events: GetWorkflowExecutionHistoryResponse;

  let { history } = events;
  let eventFormat = 'grid';
</script>

<div class="px-6 py-6">
  <EventsFilters bind:eventFormat />
  <Events {history} {eventFormat} />
</div>

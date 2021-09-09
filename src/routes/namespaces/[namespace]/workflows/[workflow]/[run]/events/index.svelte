<script context="module" lang="ts">
  import type {
    GetWorkflowExecutionHistoryResponse,
    DescribeWorkflowExecutionResponse,
  } from '$types';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ context }: LoadInput) {
    const { events, execution } = context;
    return {
      props: {
        events,
        execution,
      },
    };
  }
</script>

<script lang="ts">
  import Events from './_events.svelte';
  import EventsFilters from './_events-filters.svelte';
  export let events: GetWorkflowExecutionHistoryResponse;
  export let execution: DescribeWorkflowExecutionResponse;
  export let eventType;

  let { history } = events;
  let eventFormat: EventFormat = 'grid';
</script>

<div class="px-6 py-6">
  <EventsFilters bind:eventFormat bind:eventType {history} {execution} />
  <Events {history} {eventFormat} {eventType} />
</div>

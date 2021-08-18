<script context="module" lang="ts">
  import type { GetWorkflowExecutionHistoryResponse } from '$types/temporal/api/workflowservice/v1/request_response';

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
  import Icon, { Download } from 'svelte-hero-icons';
  export let events: GetWorkflowExecutionHistoryResponse;
  export let execution;

  let { history } = events;
  let eventsString = JSON.stringify(events);
  let dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(eventsString);
</script>

<div class="px-6 py-6">
  <a
    class="text-black-500 font-bold uppercase px-3 py-1 text-xs flex"
    href={dataUri}
    download={`${execution.workflowExecutionInfo.type.name}.json`}
  >
    <Icon src={Download} class="text-black w-4 h-4" />export</a
  >
  <Events {history} />
</div>

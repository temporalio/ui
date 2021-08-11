<script lang="ts">
  import beautify from 'json-beautify';
  import { formatDate } from '$lib/utilities/format-date';
  import type { HistoryEvent } from '$types/temporal/api/history/v1/message';
  import ExecutionInformation from '../_execution-information.svelte';

  export let event: HistoryEvent;
  export let index: number;

  let baseTypes = ['eventId', 'eventTime', 'eventType', 'version', 'taskId'];
  let [type] = Object.keys(event).filter((key) => !baseTypes.includes(key));

  let even = !(index % 2);
</script>

<tr class:even>
  <td>{event.eventId}</td>
  <td>{event.eventType} ({type})</td>
  <td>{formatDate(event.eventTime)}</td>
  <td>
    <div class="flex">
      <ExecutionInformation title="Version" value={event.version} />
      <ExecutionInformation title="Task ID" value={event.taskId} />
    </div>

    <pre><code>{beautify(event, null, 2, 80)}</code></pre>
  </td>
</tr>

<style lang="postcss">
  tr {
    @apply py-4 my-4;
    @apply bg-gray-50;
  }

  td {
    vertical-align: top;
    @apply p-4;
  }

  h3 {
    @apply font-semibold;
  }

  .even {
    @apply bg-gray-100;
  }
</style>

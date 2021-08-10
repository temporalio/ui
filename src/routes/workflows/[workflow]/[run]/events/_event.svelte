<script lang="ts">
  import beautify from 'json-beautify';
  import { formatDate } from '$lib/utilities/format-date';
  import type { HistoryEvent } from '$types/temporal/api/history/v1/message';

  export let event: HistoryEvent;
  export let index: number;

  let even = !(index % 2);
</script>

<tr class:even>
  <td>{event.eventId}</td>
  <td>{event.eventType}</td>
  <td>{formatDate(event.eventTime)}</td>
  <td><pre><code>{beautify(event, null, 2, 80)}</code></pre></td>
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

  .even {
    @apply bg-gray-100;
  }
</style>

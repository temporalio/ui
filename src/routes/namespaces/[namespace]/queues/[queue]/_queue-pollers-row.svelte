<script lang="ts">
  import type { PollerWithTaskQueueTypes } from '$lib/services/pollers-service';
  import { formatDate } from '$lib/utilities/format-date';

  export let poller: PollerWithTaskQueueTypes;
</script>

<tr>
  <td>
    <h3>
      {poller.identity}
    </h3>
  </td>
  <td>
    <p>{formatDate(poller.lastAccessTime)}</p>
  </td>
  {#if poller.taskQueueTypes.includes('WORKFLOW')}
    <td>
      <i class="fas fa-check" />
    </td>
  {:else}
    <td />
  {/if}
  {#if poller.taskQueueTypes.includes('ACTIVITY')}
    <td>
      <i class="fas fa-check" />
    </td>
  {:else}
    <td />
  {/if}
</tr>

<style lang="postcss">
  h3 {
    @apply font-normal m-0 text-base text-gray-900;
  }

  p {
    @apply m-0 text-gray-500 text-sm;
  }

  tr {
    @apply bg-gray-50;
  }

  tr:hover {
    @apply bg-gray-100;
  }

  td {
    @apply p-0;
  }
</style>

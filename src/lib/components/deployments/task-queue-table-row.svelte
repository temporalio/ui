<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { TaskQueueInfo } from '$lib/types/deployments';
  import { routeForTaskQueue } from '$lib/utilities/route-for';

  export let taskQueue: TaskQueueInfo;
  export let columns: ConfigurableTableHeader[];
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.task-queue-name')}
      <td class="cell"
        ><Link
          href={routeForTaskQueue({
            namespace: $page.params.namespace,
            queue: taskQueue.name,
          })}>{taskQueue.name}</Link
        ></td
      >
    {:else if label === translate('deployments.task-queue-type')}
      <td class="cell truncate">{taskQueue.type}</td>
    {:else if label === translate('deployments.worker-id')}
      <td class="cell truncate">???</td>
    {/if}
  {/each}
</tr>

<style lang="postcss">
  .cell {
    @apply p-2 text-left;
  }
</style>

<script lang="ts">
  import { page } from '$app/stores';

  import WorkerTable from '$lib/components/worker-table.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { TaskQueueResponse } from '$lib/types';
  import { routeForTaskQueue } from '$lib/utilities/route-for';

  export let taskQueue: string;
  export let workers: TaskQueueResponse;

  $: ({ namespace } = $page.params);
</script>

<section class="flex flex-col gap-4">
  <WorkerTable {workers}>
    <p data-testid="task-queue-name">
      {translate('common.task-queue')}:
      <Link
        href={routeForTaskQueue({
          namespace,
          queue: taskQueue,
        })}>{taskQueue}</Link
      >
    </p>
  </WorkerTable>
</section>

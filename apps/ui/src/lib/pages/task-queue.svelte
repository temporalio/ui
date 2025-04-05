<script lang="ts">
  import { page } from '$app/stores';

  import WorkerTable from '$lib/components/worker-table.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getPollers } from '$lib/services/pollers-service';
  import { taskQueueView } from '$lib/stores/task-queue-view';

  import TaskQueueVersioning from './task-queue-versioning.svelte';

  $: ({ queue: taskQueue, namespace } = $page.params);

  const onTab = (view: 'workers' | 'versioning') => {
    $taskQueueView = view;
  };
</script>

{#await getPollers({ queue: taskQueue, namespace }) then workers}
  <section class="flex flex-col gap-4">
    <h2 data-testid="task-queue-name">
      {taskQueue}
    </h2>
    <Tabs>
      <TabList class="flex flex-wrap gap-6 p-4 pl-0" label="task queue detail">
        <Tab
          label={translate('workers.workers')}
          id="worker-tab"
          onClick={() => onTab('workers')}
          active={$taskQueueView === 'workers'}
        />
        <Tab
          label={translate('workers.versioning')}
          id="versioning-tab"
          onClick={() => onTab('versioning')}
          active={$taskQueueView === 'versioning'}
        />
      </TabList>
    </Tabs>
    {#if $taskQueueView === 'versioning'}
      <TaskQueueVersioning {taskQueue} {workers} />
    {:else}
      <WorkerTable {workers} />
    {/if}
  </section>
{/await}

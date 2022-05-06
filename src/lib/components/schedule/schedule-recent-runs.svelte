<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import WorkflowStatus from '../workflow-status.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';

  const runs = [
    {
      status: 'Completed',
      id: 'SchedulemeID3-WorkflowTypeName-1',
      endTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      status: 'Failed',
      id: 'SchedulemeID3-WorkflowTypeName-2',
      endTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      status: 'TimedOut',
      id: 'SchedulemeID3-WorkflowTypeName-3',
      endTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      status: 'Canceled',
      id: 'SchedulemeID3-WorkflowTypeName-4',
      endTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      status: 'Terminated',
      id: 'SchedulemeID3-WorkflowTypeName-5',
      endTime: '2022-05-06T15:35:36.730883Z',
    },
  ];
</script>

<Panel>
  <h2 class="text-2xl mb-4">Recent Runs</h2>
  {#each runs as run (run.id)}
    <div class="row">
      <div class="w-28">
        <WorkflowStatus status={run.status} />
      </div>
      <div class="w-96">{run.id}</div>
      <div class="ml-auto"><p>{formatDate(run.endTime, $timeFormat)}</p></div>
    </div>
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply inline-flex border-b-2 border-gray-300 my-1 py-1 w-full;
  }
  .cell {
    @apply text-left;
  }
</style>

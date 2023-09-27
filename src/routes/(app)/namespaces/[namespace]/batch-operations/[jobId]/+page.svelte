<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';

  $: operation = $page.data.batchOperation;
  $: completePercent =
    operation.completeOperationCount / operation.totalOperationCount;
  $: failurePercent =
    operation.failureOperationCount / operation.totalOperationCount;

  let completeWidth: number;
  let failureWidth: number;
  let operationGraphContainerWidth: number;

  $: {
    if (operationGraphContainerWidth) {
      completeWidth = Math.floor(
        completePercent * operationGraphContainerWidth,
      );
      failureWidth = Math.floor(failurePercent * operationGraphContainerWidth);
    }
  }

  const jobStateToBadgeType = {
    Completed: 'green',
    Running: 'blue',
    Failed: 'red',
  };
</script>

<PageTitle title={`Batch Operation ${operation.jobId}`} />

<div>
  <div class="flex gap-4">
    <h1 class="text-2xl">Batch Operation</h1>
    <Badge type={jobStateToBadgeType[operation.state]}>
      {operation.state}
    </Badge>
  </div>
  <h2 class="text-sm">
    {operation.jobId}
  </h2>
</div>

<Card>
  <div class="flex flex-col gap-2 text-sm">
    <div class="grid grid-cols-10 border-b">
      <p class="col-span-2 text-sm font-semibold">Operation Type</p>
      <p class="col-span-8">{operation.operationType}</p>
    </div>
    <div class="grid grid-cols-10 border-b">
      <p class="col-span-2 text-sm font-semibold">Identity</p>
      <p class="col-span-8">{operation.identity}</p>
    </div>
    <div class="grid grid-cols-10 border-b">
      <p class="col-span-2 text-sm font-semibold">Reason</p>
      <p class="col-span-8">{operation.reason}</p>
    </div>
    <div class="grid grid-cols-10 border-b">
      <p class="col-span-2 text-sm font-semibold">Start Time</p>
      <p class="col-span-8">{formatDate(operation.startTime, $timeFormat)}</p>
    </div>
    <div class="grid grid-cols-10">
      <p class="col-span-2 text-sm font-semibold">Close Time</p>
      <p class="col-span-8">{formatDate(operation.closeTime, $timeFormat)}</p>
    </div>
  </div>
</Card>

<Card>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold">
      Total Operation Count: {Intl.NumberFormat('en-US').format(
        operation.totalOperationCount,
      )}
    </p>

    <div
      class="relative h-10 w-full overflow-hidden rounded"
      bind:clientWidth={operationGraphContainerWidth}
    >
      <div
        style="width:{completeWidth}px;"
        class="absolute left-0 flex h-full items-center bg-green-500 p-2"
        class:hidden={operation.completeOperationCount === 0}
      >
        <span class="text-xs font-semibold text-white"
          >{Intl.NumberFormat('en-US').format(operation.completeOperationCount)}
          completed</span
        >
      </div>
      <div
        style="width:{failureWidth}px;"
        class="absolute right-0 flex h-full items-center justify-end bg-red-500 p-2"
        class:hidden={operation.failureOperationCount === 0}
      >
        <span class="text-xs font-semibold text-white"
          >{Intl.NumberFormat('en-US').format(operation.failureOperationCount)} failed</span
        >
      </div>
    </div>
  </div>
</Card>

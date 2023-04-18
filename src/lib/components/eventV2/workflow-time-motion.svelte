<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { timeDiffStore } from '$lib/stores/elapsed-time';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatElasped } from '$lib/utilities/format-time';

  $: ({ workflow } = $workflowRun);

  $: timeDiff = timeDiffStore(workflow.startTime, workflow.endTime);

  // let fetchWorkflowTypeAverge =
</script>

<div class="relative h-auto bg-gray-900 w-full md:w-1/2 rounded-xl">
  <div class="flex items-center h-full p-4 px-8">
    <div class="duration">
      <h3 class="text-white flex gap-2"><Icon name="graph" />Duration</h3>
      <svg
        class="wave"
        viewBox="0 0 600 100"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100px"
      >
        <defs>
          <path
            stroke="#6EE7B7"
            fill="none"
            id="sine-wave"
            d="M0 50
           C 40 10, 60 10, 100 50 C 140 90, 160 90, 200 50
           C 240 10, 260 10, 300 50 C 340 90, 360 90, 400 50
           C 440 10, 460 10, 500 50 C 540 90, 560 90, 600 50"
          />
        </defs>
        <use xlink:href="#sine-wave" x="0" y="0">
          <animate
            attributeName="x"
            from="0"
            to="-600"
            dur={workflow.isRunning ? '4s' : 0}
            repeatCount="indefinite"
          />
        </use>
        <use xlink:href="#sine-wave" x="300" y="0">
          <animate
            attributeName="x"
            from="600"
            to="0"
            dur={workflow.isRunning ? '4s' : 0}
            repeatCount="indefinite"
          />
        </use>
      </svg>
      <p class="text-white text-base time">{formatElasped($timeDiff)}</p>
      <div class="w-full text-white text-left text-[12px] flex flex-col gap-0">
        {#if workflow.endTime && workflow.endTime !== 'null'}
          <p>
            <span class="inline-block w-10">End:</span>{formatDate(
              workflow.endTime,
              $timeFormat,
            )}
          </p>
        {/if}
        <p>
          <span class="inline-block w-10">Start:</span>{formatDate(
            workflow.startTime,
            $timeFormat,
          )}
        </p>
      </div>
    </div>
    <div class="median">
      <p class="text-white text-base">(μ)</p>
      <div class="w-1 bg-blue-300 h-full" />
      <p class="text-white text-base time">{formatElasped(125)}</p>
    </div>
    <div class="max">
      <p class="text-white text-base">99%</p>
      <div class="w-1 bg-red-300 h-full" />
      <p class="text-white text-base time">{formatElasped(210)}</p>
    </div>
  </div>
</div>

<style lang="postcss">
  .duration {
    @apply flex flex-col h-full w-1/2 justify-center items-start gap-0;

    touch-action: none;
  }

  .median,
  .max {
    @apply flex flex-col h-full w-1/4 justify-center items-center gap-1;

    touch-action: none;
  }

  .max {
    @apply justify-end items-end;
  }

  .wave path {
    stroke-width: 4px;
  }
</style>

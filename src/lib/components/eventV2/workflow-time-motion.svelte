<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { timeDiffStore } from '$lib/stores/elapsed-time';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatElasped } from '$lib/utilities/format-time';

  $: ({ workflow } = $workflowRun);

  $: timeDiff = timeDiffStore(workflow.startTime, workflow.endTime);
</script>

<div class="relative h-auto bg-gray-900 w-full md:w-1/2 rounded-xl">
  <div class="flex items-center h-full p-4">
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
            dur="4s"
            repeatCount="indefinite"
          />
        </use>
        <use xlink:href="#sine-wave" x="300" y="0">
          <animate
            attributeName="x"
            from="600"
            to="0"
            dur="4s"
            repeatCount="indefinite"
          />
        </use>
      </svg>
      <p class="text-white text-base">{formatElasped($timeDiff)}</p>
      <div class="w-full text-white text-sm flex gap-2">
        <p>
          Start: {formatDate(workflow.startTime, $timeFormat)}
        </p>
        {#if workflow.endTime}
          <p>
            End: {formatDate(workflow.endTime, $timeFormat)}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .duration {
    @apply flex flex-col h-full w-1/2 justify-center items-start gap-0;
    touch-action: none;
  }

  .wave path {
    stroke-width: 4px;
  }
</style>

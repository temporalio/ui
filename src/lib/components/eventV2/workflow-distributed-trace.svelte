<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow } = $workflowRun);
</script>

<div class="relative h-auto bg-gray-900 w-full md:w-1/2 rounded-xl">
  <div class="flex items-center h-full p-4">
    <div class="duration">
      <h3 class="text-white flex gap-2">
        <Icon name="graph" />Distrubted Trace
      </h3>
      <div class="w-full flex flex-col gap-2 items-center justify-center">
        <div class="w-2/12 h-3 bg-pink-200 rounded-xl" />
        <div class="w-4/12 h-3 bg-purple-200 rounded-xl" />
        <div class="w-6/12 h-3 bg-blue-300 rounded-xl" />
        <div class="w-8/12 h-3 bg-green-300 rounded-xl" />
        <div class="w-10/12 h-3 bg-yellow-300 rounded-xl" />
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .duration {
    @apply flex flex-col h-full w-full justify-between items-start gap-0;

    touch-action: none;
  }

  .wave path {
    stroke-width: 4px;
  }
</style>

<script lang="ts">
  import EventSummaryV2 from '$lib/components/eventV2/event-summary-v2.svelte';
  import WorkflowOptionsV2 from '$lib/components/eventV2/workflow-options-v2.svelte';

  let debugMode = false;
  let advancedMode = false;
</script>

<div class="flex flex-col gap-2 xl:flex-row-reverse">
  <div class="flex w-full flex-col gap-2 xl:w-[40%]">
    <WorkflowOptionsV2
      onDebugClick={() => (debugMode = !debugMode)}
      onAdvancedClick={() => (advancedMode = !advancedMode)}
    />
  </div>
  <div class="w-full xl:w-[60%]">
    <EventSummaryV2 importingHistory {debugMode} {advancedMode} />
  </div>
</div>

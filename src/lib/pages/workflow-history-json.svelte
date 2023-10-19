<script lang="ts">
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { fullEventHistory } from '$lib/stores/events';

  let decodeEventHistory = true;
</script>

<WorkflowJsonNavigator events={$fullEventHistory} {decodeEventHistory}>
  <ToggleSwitch
    slot="decode"
    label="View decoded event history"
    id="decode-event-history"
    bind:checked={decodeEventHistory}
    data-testid="decode-event-history-toggle"
  />
</WorkflowJsonNavigator>

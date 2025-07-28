<script lang="ts">
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { decodeEventHistory, filteredEventHistory } from '$lib/stores/events';
</script>

<WorkflowJsonNavigator events={$filteredEventHistory}>
  {#snippet decode()}
    <ToggleSwitch
      label={translate('events.decode-event-history')}
      id="decode-event-history"
      bind:checked={$decodeEventHistory}
      data-testid="decode-event-history-toggle"
    />
  {/snippet}
</WorkflowJsonNavigator>

<script lang="ts">
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import WorkflowRawHistoryLink from '$lib/components/workflow-raw-history-link.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { decodeEventHistory, filteredEventHistory } from '$lib/stores/events';
</script>

<WorkflowJsonNavigator events={$filteredEventHistory}>
  <ToggleSwitch
    slot="decode"
    label={translate('events.decode-event-history')}
    id="decode-event-history"
    bind:checked={$decodeEventHistory}
    data-testid="decode-event-history-toggle"
  />

  <WorkflowRawHistoryLink slot="viewraw" />
</WorkflowJsonNavigator>

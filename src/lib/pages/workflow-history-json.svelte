<svelte:options runes />

<script lang="ts">
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { decodeEventHistory, filteredEventHistory } from '$lib/stores/events';
  import type { WorkflowEvent } from '$lib/types/events';

  interface Props {
    events?: WorkflowEvent[];
  }

  let { events }: Props = $props();

  const resolvedEvents = $derived(events ?? $filteredEventHistory);
</script>

<WorkflowJsonNavigator events={resolvedEvents}>
  {#snippet decode()}
    <ToggleSwitch
      label={translate('events.decode-event-history')}
      id="decode-event-history"
      bind:checked={$decodeEventHistory}
      data-testid="decode-event-history-toggle"
    />
  {/snippet}
</WorkflowJsonNavigator>

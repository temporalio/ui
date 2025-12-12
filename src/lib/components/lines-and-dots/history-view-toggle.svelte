<script lang="ts">
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { historyViewType } from '$lib/stores/event-view';
</script>

<div class="flex items-center gap-2">
  <ToggleButtons>
    <ToggleButton
      active={$historyViewType === 'summary'}
      data-testid="summary"
      leadingIcon="lightning-bolt"
      size="sm"
      on:click={() => ($historyViewType = 'summary')}>Summary</ToggleButton
    >
    <ToggleButton
      data-testid="timeline-view"
      size="sm"
      leadingIcon="timeline"
      active={$historyViewType === 'timeline'}
      on:click={() => ($historyViewType = 'timeline')}
    >
      {translate('workflows.timeline-tab')}
    </ToggleButton>
    <ToggleButton
      data-testid="compact-view"
      size="sm"
      leadingIcon="compact"
      active={$historyViewType === 'compact'}
      on:click={() => ($historyViewType = 'compact')}
    >
      Compact
    </ToggleButton>
    <ToggleButton
      data-testid="history-view"
      size="sm"
      leadingIcon="feed"
      active={$historyViewType === 'history'}
      on:click={() => ($historyViewType = 'history')}
    >
      All
    </ToggleButton>
    <ToggleButton
      data-testid="json-view"
      size="sm"
      leadingIcon="json"
      active={$historyViewType === 'json'}
      on:click={() => ($historyViewType = 'json')}
    >
      JSON
    </ToggleButton>
    <ToggleButton
      data-testid="relationship-view"
      size="sm"
      leadingIcon="relationship"
      active={$historyViewType === 'relationship'}
      on:click={() => ($historyViewType = 'relationship')}
    >
      {translate('workflows.relationships')}
    </ToggleButton>
    <ToggleButton
      data-testid="workers-view"
      size="sm"
      leadingIcon="merge"
      active={$historyViewType === 'workers'}
      on:click={() => ($historyViewType = 'workers')}
    >
      Workers
    </ToggleButton>
  </ToggleButtons>
</div>

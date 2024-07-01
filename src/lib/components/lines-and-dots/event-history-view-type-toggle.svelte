<script lang="ts">
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventViewType } from '$lib/stores/event-view';
</script>

<div class="flex flex-col items-center gap-2 md:flex-row md:gap-4">
  <h2 class="text-2xl font-medium">
    {translate('workflows.event-history')}
  </h2>
  <ToggleButtons>
    <ToggleButton
      active={$eventViewType === 'compact'}
      data-testid="compact"
      on:click={() => ($eventViewType = 'compact')}
      >{translate('workflows.compact')}</ToggleButton
    >
    <ToggleButton
      active={$eventViewType === 'timeline'}
      data-testid="timeline"
      on:click={() => ($eventViewType = 'timeline')}
      >{translate('common.timeline')}</ToggleButton
    >
    <ToggleButton
      active={$eventViewType === 'feed'}
      data-testid="feed"
      on:click={() => ($eventViewType = 'feed')}
      >{translate('workflows.full-history')}</ToggleButton
    >
    <ToggleButton
      active={$eventViewType === 'table'}
      data-testid="table"
      on:click={() => ($eventViewType = 'table')}
      >{translate('workflows.table')}</ToggleButton
    >
  </ToggleButtons>
</div>

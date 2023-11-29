<script lang="ts">
  import { page } from '$app/stores';

  import IconButton from '$lib/holocene/icon-button.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventViewType } from '$lib/stores/event-view';
  import type { EventView } from '$lib/types/events';

  export let float = false;
  export let showDownloadPrompt;

  const onViewClick = (view: EventView) => {
    if ($page.url.searchParams.get('page')) {
      $page.url.searchParams.delete('page');
    }
    $eventViewType = view;
  };
</script>

<div
  id={float ? 'event-view-toggle' : 'event-view-toggle-v2'}
  class="mt-4 flex items-center gap-2"
>
  <div class="flex items-center bg-white">
    <ToggleButtons>
      <ToggleButton
        icon="feed"
        active={$eventViewType === 'feed'}
        data-testid="feed"
        on:click={() => onViewClick('feed')}
        >{translate('workflows.history')}</ToggleButton
      >
      <ToggleButton
        icon="compact"
        active={$eventViewType === 'compact'}
        data-testid="compact"
        on:click={() => onViewClick('compact')}
        >{translate('workflows.compact')}</ToggleButton
      >
      <ToggleButton
        icon="json"
        active={$eventViewType === 'json'}
        data-testid="json"
        on:click={() => onViewClick('json')}
        >{translate('workflows.json')}</ToggleButton
      >
    </ToggleButtons>
  </div>
  <IconButton
    icon="upload"
    class="rotate-180"
    data-testid="download"
    label="download"
    on:click={() => (showDownloadPrompt = true)}
  />
</div>

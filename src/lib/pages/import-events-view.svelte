<script lang="ts">
  import { routeForEventHistoryImport } from '$lib/utilities/route-for';

  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import HistoryImport from '$lib/components/import/event-history-file-import.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
</script>

<section id="event-history">
  <nav
    class="flex items-end justify-between gap-4 pb-4"
    aria-label="import event history"
  >
    <h3 class="text-lg font-medium">Import Event History</h3>
    <div class="flex gap-4">
      <HistoryImport />
    </div>
  </nav>
  <nav
    class="my-4 flex items-end justify-end gap-4"
    aria-label="event history view"
  >
    <div id="event-view-toggle" class="flex gap-4 bg-white">
      <ToggleButtons>
        <ToggleButton
          icon="feed"
          href={routeForEventHistoryImport($lastUsedNamespace, 'feed')}
          >Timeline</ToggleButton
        >
        <ToggleButton
          icon="compact"
          href={routeForEventHistoryImport($lastUsedNamespace, 'compact')}
          >Compact</ToggleButton
        >
        <ToggleButton
          icon="json"
          href={routeForEventHistoryImport($lastUsedNamespace, 'json')}
          >JSON</ToggleButton
        >
      </ToggleButtons>
    </div>
  </nav>
  <slot />
</section>

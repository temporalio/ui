<script lang="ts">
  import {
    faCode,
    faLayerGroup,
    faTable,
  } from '@fortawesome/free-solid-svg-icons';

  import { routeForImport } from '$lib/utilities/route-for';

  import HistoryImport from '$lib/components/event/event-history-import.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
</script>

<section id="event-history">
  <nav class="flex gap-4 justify-between items-end pb-4">
    <h3 class="text-lg font-medium">Event History</h3>
    <div class="flex gap-4">
      <HistoryImport />
    </div>
  </nav>
  <nav class="flex gap-4 justify-end items-end pb-4">
    <div id="event-view-toggle" class="flex gap-4">
      <ToggleButtons>
        <ToggleButton
          icon={faTable}
          href={routeForImport({ importType: 'events', view: 'feed' })}
          >Timeline</ToggleButton
        >
        <ToggleButton
          icon={faLayerGroup}
          href={routeForImport({ importType: 'events', view: 'compact' })}
          >Compact</ToggleButton
        >
        <ToggleButton
          icon={faCode}
          href={routeForImport({ importType: 'events', view: 'json' })}
          >JSON</ToggleButton
        >
      </ToggleButtons>
    </div>
  </nav>
  <slot />
</section>

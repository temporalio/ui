<script lang="ts">
  import {
    faCode,
    faLayerGroup,
    faTable,
  } from '@fortawesome/free-solid-svg-icons';
  import { routeForImport } from '$lib/utilities/route-for';

  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import HistoryImport from '../../../../../_event-history-import.svelte';
</script>

<section id="event-history">
  <nav class="flex items-end justify-between gap-4 pb-4">
    <h3 class="text-lg font-medium">Event History</h3>
    <div class="flex gap-4">
      <HistoryImport />
    </div>
  </nav>
  <nav class="flex items-end justify-end gap-4 pb-4">
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

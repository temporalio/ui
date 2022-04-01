<script lang="ts">
  import {
    faBars,
    faCode,
    faLayerGroup,
    faTable,
  } from '@fortawesome/free-solid-svg-icons';

  import { routeForImport } from '$lib/utilities/route-for';

  import HistoryImport from '$lib/components/event/event-history-import.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
</script>

<section class="flex flex-col gap-4">
  <nav class="relative flex gap-4 justify-between items-end pb-4 max-w-1/2">
    <h3 class="text-lg font-medium">Event History</h3>
    <div class="flex gap-4">
      <ToggleButtons>
        <ToggleButton
          icon={faTable}
          href={routeForImport({ importType: 'events', view: 'summary' })}
          ><span class="hidden md:block">Summary</span></ToggleButton
        >
        <ToggleButton
          icon={faBars}
          href={routeForImport({ importType: 'events', view: 'full' })}
          ><span class="hidden md:block">Full</span></ToggleButton
        >
        <ToggleButton
          icon={faLayerGroup}
          href={routeForImport({ importType: 'events', view: 'compact' })}
          ><span class="hidden md:block">Compact</span></ToggleButton
        >
        <ToggleButton
          icon={faCode}
          href={routeForImport({ importType: 'events', view: 'json' })}
          ><span class="hidden md:block">JSON</span></ToggleButton
        >
      </ToggleButtons>
      <HistoryImport />
    </div>
  </nav>
  <slot />
</section>

<script lang="ts">
  import {
    IconCode,
    IconCompact,
    IconTable,
    IconTableDense,
    IconTimeline,
  } from '$lib/io/icon';
  import { ToggleGroup } from '$lib/io-ark/toggle-group';

  let view = $state(['compact']);
  let display = $state(['timestamps']);
  let density = $state(['comfortable']);
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <ToggleGroup
      label="Event history view"
      items={[
        { value: 'compact', label: 'Compact', Icon: IconCompact },
        { value: 'timeline', label: 'Timeline', Icon: IconTimeline },
        { value: 'json', label: 'JSON', Icon: IconCode },
      ]}
      bind:value={view}
    />
    <p class="text-xs text-secondary">Showing the {view[0]} view</p>
  </div>
  <div class="flex flex-col gap-2">
    <ToggleGroup
      label="Event details"
      multiple
      size="sm"
      items={[
        { value: 'timestamps', label: 'Timestamps' },
        { value: 'durations', label: 'Durations' },
        { value: 'payloads', label: 'Payloads' },
        { value: 'raw', label: 'Raw IDs', disabled: true },
      ]}
      bind:value={display}
    />
    <p class="text-xs text-secondary">
      {display.length ? `Showing ${display.join(', ')}` : 'Showing names only'}
    </p>
  </div>
  <ToggleGroup
    label="Table density"
    items={[
      { value: 'comfortable', Icon: IconTable, ariaLabel: 'Comfortable' },
      { value: 'compact', Icon: IconTableDense, ariaLabel: 'Compact' },
    ]}
    bind:value={density}
  />
</div>

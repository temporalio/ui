<script lang="ts">
  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getEventMarkerPresentation } from '$lib/services/grouped-event-buffer';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import type { EventGroupMarker } from '$lib/types/events';

  let { markers }: { markers: EventGroupMarker[] } = $props();

  const presentations = $derived.by(() => {
    void eventBuffer.version;
    return markers.flatMap((marker) => {
      const presentation = getEventMarkerPresentation(marker);
      return presentation ? [presentation] : [];
    });
  });
</script>

{#if presentations.length}
  <div class="flex items-start gap-4">
    <p class="text-secondary/80 min-w-56 text-sm">
      {translate('workflows.event-groups')}
    </p>
    <div class="flex min-w-0 flex-1 flex-wrap gap-1">
      {#each presentations as presentation, index (`${presentation.key}:${index}`)}
        <PayloadSummary
          value={presentation.label}
          fallback={presentation.displayName}
        >
          {#snippet children(decodedValue)}
            <span
              class="inline-block min-w-0 max-w-full whitespace-normal break-words rounded-sm bg-interactive-primary px-1.5 py-0.5 text-xs font-medium text-white"
              >{decodedValue}</span
            >
          {/snippet}
        </PayloadSummary>
      {/each}
    </div>
  </div>
{/if}

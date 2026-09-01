<script lang="ts">
  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import Badge from '$lib/holocene/badge.svelte';
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
    <p class="min-w-56 text-sm text-secondary/80">
      {translate('workflows.event-groups')}
    </p>
    <div class="flex min-w-0 flex-1 flex-wrap gap-1">
      {#each presentations as presentation, index (`${presentation.key}:${index}`)}
        <PayloadSummary
          value={presentation.label}
          fallback={presentation.displayName}
        >
          {#snippet children(decodedValue)}
            <Badge
              class="w-full min-w-0 max-w-fit gap-1 border border-brand bg-brand px-1.5 py-0.5 text-left text-xs text-white shadow-sm"
            >
              <span
                class="overflow-wrap-anywhere w-full min-w-0 whitespace-normal text-wrap"
                >{decodedValue}</span
              >
            </Badge>
          {/snippet}
        </PayloadSummary>
      {/each}
    </div>
  </div>
{/if}

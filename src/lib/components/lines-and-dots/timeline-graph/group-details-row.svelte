<script lang="ts">
  import { onMount } from 'svelte';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import EventStatusBadge, {
    type EventStatus,
  } from '$lib/components/event/event-status-badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconClock, IconClose } from '$lib/io/icon';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { formatEventGroupDuration } from '$lib/utilities/event-group-duration';

  type Props = {
    group: EventGroup;
    canvasWidth: number;
    endTime?: string | Date | number;
    x?: number;
    y: number;
    // Reports panel height so timeline-graph can shift the rows below it.
    onHeight?: (h: number) => void;
    timelineKey?: string;
    active?: boolean;
  };

  let {
    group,
    canvasWidth,
    endTime = Date.now(),
    x = 0,
    y,
    onHeight,
    timelineKey = group.id,
    active = true,
  }: Props = $props();

  // ResizeObserver so the height re-measures when CodeMirror lazily swaps in.
  let contentEl = $state<HTMLDivElement | undefined>(undefined);
  let contentHeight = 0;

  onMount(() => {
    if (!contentEl) return;
    const observer = new ResizeObserver(() => {
      const height = contentEl!.offsetHeight;
      if (height !== contentHeight) {
        contentHeight = height;
        onHeight?.(height);
      }
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  });

  const title = $derived(group.displayName);

  const duration = $derived(
    formatEventGroupDuration({ group, endTime, includeMilliseconds: true }),
  );

  const status = $derived.by<EventStatus>(() => {
    const pending = active ? group.pendingActivity : undefined;
    if (pending) {
      if (pending.paused) return 'Paused';
      if ((pending.attempt ?? 0) > 1) return 'Retrying';
      return 'Pending';
    }
    return group.finalClassification || group.classification;
  });
</script>

<div
  class="panel"
  style:left="{x}px"
  style:top="{y}px"
  style:width="{canvasWidth}px"
>
  <div bind:this={contentEl} class="flex flex-col">
    <div
      class="relative flex h-full items-center justify-between bg-surface-secondary text-sm"
    >
      <div class="flex h-full items-center gap-4 px-2">
        <EventStatusBadge {status} />
        {title}
        {#if duration}
          <div class="flex items-center gap-1">
            <IconClock />
            {duration}
          </div>
        {/if}
      </div>
      <div class="flex items-center gap-4">
        <Button
          variant="ghost"
          size="xs"
          onclick={() => setActiveGroup(group, timelineKey)}
          >{translate('common.close')} <IconClose /></Button
        >
      </div>
    </div>
    <div class="bg-surface-primary text-primary">
      <EventDetailsFull
        {group}
        event={group.initialEvent}
        lazy={true}
        groupRow={true}
      />
    </div>
  </div>
</div>

<style lang="postcss">
  .panel {
    position: absolute;
    z-index: 50;
  }
</style>

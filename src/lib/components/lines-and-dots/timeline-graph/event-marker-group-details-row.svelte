<script lang="ts">
  import { onMount } from 'svelte';

  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { TimelineEventMarkerGroup } from '$lib/models/event-marker-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { eventTypeFilter } from '$lib/stores/filters';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatEventGroupDuration } from '$lib/utilities/event-group-duration';

  import GraphWidget from './graph-widget.svelte';

  type Props = {
    group: TimelineEventMarkerGroup;
    workflow: WorkflowExecution;
    canvasWidth: number;
    endTime?: string | Date | number;
    x?: number;
    y: number;
    onHeight?: (height: number) => void;
  };

  let {
    group,
    workflow,
    canvasWidth,
    endTime = Date.now(),
    x = 0,
    y,
    onHeight,
  }: Props = $props();

  let contentEl = $state<HTMLDivElement | undefined>(undefined);

  onMount(() => {
    if (!contentEl) return;
    const observer = new ResizeObserver(() => {
      onHeight?.(contentEl!.offsetHeight);
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  });

  const duration = $derived(
    formatEventGroupDuration({ group, endTime, includeMilliseconds: true }),
  );
  const filteredLifecycleGroups = $derived(
    group.lifecycleGroups.filter((lifecycleGroup) =>
      $eventTypeFilter.includes(lifecycleGroup.category),
    ),
  );
  const timelineSnapshot = $derived({
    workflow,
    groups: filteredLifecycleGroups,
  });
</script>

<div
  class="absolute z-50"
  style:left="{x}px"
  style:top="{y}px"
  style:width="{canvasWidth}px"
>
  <div bind:this={contentEl} class="flex flex-col">
    <div
      class="relative flex h-full min-w-0 items-center justify-between bg-slate-50 text-sm dark:bg-slate-800"
    >
      <div class="flex h-full min-w-0 flex-1 items-center gap-4 px-2">
        <PayloadSummary
          value={group.userMetadata?.summary}
          fallback={group.displayName}
        >
          {#snippet children(decodedValue)}
            <span class="min-w-0 flex-1 truncate" title={decodedValue}
              >{decodedValue}</span
            >
          {/snippet}
        </PayloadSummary>
        <span class="shrink-0">
          {translate('workflows.event-group-event-count', {
            count: group.eventList.length,
          })}
        </span>
        {#if duration}
          <span class="flex shrink-0 items-center gap-1">
            <Icon name="clock" />
            {duration}
          </span>
        {/if}
      </div>
      <Button
        class="shrink-0"
        variant="ghost"
        size="xs"
        onclick={() => setActiveGroup(group)}
      >
        {translate('common.close')}
        <Icon name="close" />
      </Button>
    </div>
    <div class="surface-primary p-1">
      <p class="mb-1 text-secondary">
        {translate('workflows.event-group-events')}
      </p>
      <GraphWidget
        snapshot={timelineSnapshot}
        viewportHeight={320}
        readOnly={false}
        class="surface-primary overflow-x-hidden border-t border-subtle"
      />
    </div>
  </div>
</div>

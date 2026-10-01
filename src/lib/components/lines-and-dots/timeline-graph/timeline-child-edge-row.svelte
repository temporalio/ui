<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';

  import { GUTTER } from './constants';
  import type { TimelineChildEdge } from './recursive-timeline-model';

  import TimelineChildToggleIcon from './timeline-child-toggle-icon.svelte';

  type Props = {
    edge: TimelineChildEdge;
    canvasWidth: number;
    anchorX?: number;
    viewportPinned?: boolean;
    presentation?: 'control' | 'state';
    onToggle: (edgeKey: string) => void;
    onRetry: (edgeKey: string) => void;
  };

  let {
    edge,
    canvasWidth,
    anchorX,
    viewportPinned = false,
    presentation = 'control',
    onToggle,
    onRetry,
  }: Props = $props();

  const expanded = $derived(edge.expansion === 'expanded');
  const loadState = $derived(edge.load.state);
  const stateText = $derived.by(() => {
    if (edge.load.state === 'loading') {
      return translate('workflows.child-timeline-loading');
    }
    if (edge.load.state === 'error') {
      return edge.load.kind === 'unauthorized'
        ? translate('workflows.child-timeline-unauthorized')
        : edge.load.kind === 'unavailable'
          ? translate('workflows.child-timeline-unavailable')
          : translate('workflows.child-timeline-error');
    }
    if (edge.load.state === 'evicted') {
      return translate('workflows.child-timeline-evicted');
    }
    return '';
  });
  const actionText = $derived(
    translate(
      expanded
        ? 'workflows.child-timeline-collapse'
        : 'workflows.child-timeline-expand',
    ),
  );
  const accessibleName = $derived(
    `${actionText}: ${translate('workflows.child-timeline-control-name', {
      workflowId: edge.reference.workflowId,
      depth: edge.depth,
      state: loadState,
    })}`,
  );
  const regionId = $derived(`child-timeline-${encodeURIComponent(edge.key)}`);
  const controlPosition = $derived(
    anchorX === undefined
      ? 'right: calc(var(--timeline-gutter, 2rem) + 0.25rem)'
      : `left: ${anchorX}px`,
  );
</script>

{#if presentation === 'state'}
  <div
    class="pointer-events-auto absolute flex h-full items-center gap-2 rounded border border-primary bg-surface-primary px-3 text-sm text-secondary"
    style:left="{GUTTER + edge.depth * 8}px"
    style:width="{Math.max(0, canvasWidth - 2 * GUTTER - edge.depth * 16)}px"
    role="status"
  >
    <span>{stateText}</span>
    {#if edge.load.state === 'error' || edge.load.state === 'evicted'}
      <Button
        variant="ghost"
        size="xs"
        onclick={() => onRetry(edge.key)}
        aria-label={translate('workflows.child-timeline-retry-name', {
          workflowId: edge.reference.workflowId,
        })}>{translate('common.retry')}</Button
      >
    {/if}
  </div>
{:else}
  {#if edge.load.state === 'loaded' && expanded}
    <span id={regionId} class="sr-only" role="group">
      {translate('workflows.child-timeline-anchor', {
        workflowId: edge.reference.workflowId,
      })}
    </span>
  {/if}
  <!-- Override Button's transition-all: animating the projected left value
     makes the control jump whenever the moving timeline layer rebases. -->
  <Button
    variant="secondary"
    size="xs"
    class="pointer-events-auto absolute top-1/2 z-30 h-5 w-5 -translate-y-1/2 p-0 transition-colors"
    data-viewport-pinned={viewportPinned || undefined}
    style={controlPosition}
    onclick={() => onToggle(edge.key)}
    aria-label={accessibleName}
    aria-expanded={expanded}
    aria-controls={edge.load.state === 'loaded' && expanded
      ? regionId
      : undefined}
    loading={edge.load.state === 'loading'}
    title={actionText}
  >
    {#if edge.load.state !== 'loading'}
      <TimelineChildToggleIcon {expanded} />
    {/if}
  </Button>
{/if}

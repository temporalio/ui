<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  import { tick } from 'svelte';

  import { lifecycleVisuals } from './lifecycle-visuals';
  import {
    getTimeDomain,
    getTimeTicks,
    getTimeTickStep,
    timeToX,
  } from './time-viewport';
  import {
    collapseSceneRows,
    isSceneRowCollapsed,
  } from '../structure/collapse-scene-rows';
  import type { FlattenedSceneRow } from '../structure/types';
  import type { TimelineEventRow } from '../timeline-rows/types';

  import WorkflowTimelineIconDefs from './workflow-timeline-icon-defs.svelte';

  let { rows }: { rows: readonly FlattenedSceneRow[] } = $props();

  const LABEL_WIDTH = 256;
  const AXIS_HEIGHT = 48;
  const ROW_HEIGHT = 32;
  const WINDOW_BUFFER_PAGES = 2;
  const MAX_CONTENT_WIDTH = 4_000_000;

  let scroller: HTMLDivElement;
  let scrollTop = $state(0);
  let scrollLeft = $state(0);
  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  let zoomDurationMs = $state<number | null>(null);
  let isDebugOpen = $state(false);
  const collapsedKeys = new SvelteSet<string>();
  const openedChildKeys = new SvelteSet<string>();

  const displayedRows = $derived(
    collapseSceneRows(rows, collapsedKeys, openedChildKeys),
  );
  const domain = $derived(getTimeDomain(rows));
  const domainDuration = $derived(domain ? domain.endMs - domain.startMs : 1);
  const plotWidth = $derived(Math.max(1, viewportWidth - LABEL_WIDTH));
  const duration = $derived(
    Math.min(zoomDurationMs ?? domainDuration, domainDuration),
  );
  const contentWidth = $derived(plotWidth * (domainDuration / duration));
  const viewport = $derived.by(() => {
    if (!domain) return null;
    const left = Math.min(scrollLeft, contentWidth - plotWidth);
    const startMs = domain.startMs + (left / contentWidth) * domainDuration;
    return { startMs, endMs: Math.min(domain.endMs, startMs + duration) };
  });
  const ticks = $derived(viewport ? getTimeTicks(viewport, plotWidth) : []);
  const tickSpacingPx = $derived(
    viewport
      ? (getTimeTickStep(viewport, plotWidth) / domainDuration) * contentWidth
      : 0,
  );
  const tickOriginPx = $derived(
    domain && ticks.length && tickSpacingPx
      ? timeToX(ticks[0], domain, contentWidth) % tickSpacingPx
      : 0,
  );
  const pageRows = $derived(
    Math.max(1, Math.ceil(Math.max(viewportHeight, AXIS_HEIGHT) / ROW_HEIGHT)),
  );
  const pageIndex = $derived(Math.floor(scrollTop / (pageRows * ROW_HEIGHT)));
  const startIndex = $derived(
    Math.min(
      displayedRows.length,
      Math.max(0, (pageIndex - WINDOW_BUFFER_PAGES) * pageRows),
    ),
  );
  const endIndex = $derived(
    Math.min(
      displayedRows.length,
      (pageIndex + WINDOW_BUFFER_PAGES + 2) * pageRows,
    ),
  );
  const visibleRows = $derived(displayedRows.slice(startIndex, endIndex));
  const inspectedRow = $derived.by(() => {
    let firstEventRow: TimelineEventRow | null = null;

    for (const item of visibleRows) {
      if (item.kind !== 'event') continue;
      firstEventRow ??= item.row;
      if (
        viewport &&
        item.row.endTimeMs >= viewport.startMs &&
        item.row.startTimeMs <= viewport.endMs
      ) {
        return item.row;
      }
    }

    return firstEventRow;
  });

  function toggleCollapsed(row: FlattenedSceneRow): void {
    if (row.kind === 'event') return;
    if (row.kind === 'workflow' && row.depth > 0) {
      if (openedChildKeys.has(row.key)) openedChildKeys.delete(row.key);
      else openedChildKeys.add(row.key);
      return;
    }

    if (collapsedKeys.has(row.key)) collapsedKeys.delete(row.key);
    else collapsedKeys.add(row.key);
  }

  function showFirstEvent(row: TimelineEventRow): void {
    if (!scroller || !domain) return;
    const targetLeft = Math.max(
      0,
      Math.min(
        timeToX(row.startTimeMs, domain, contentWidth) - plotWidth * 0.2,
        contentWidth - plotWidth,
      ),
    );
    scroller.scrollTo({
      left: targetLeft,
      top: scroller.scrollTop,
      behavior: 'smooth',
    });
  }

  function pan(direction: -1 | 1): void {
    scroller?.scrollBy({
      left: direction * plotWidth * 0.25,
      behavior: 'smooth',
    });
  }

  async function zoom(factor: number): Promise<void> {
    if (!domain || !viewport) return;
    const midpoint = (viewport.startMs + viewport.endMs) / 2;
    const minimumDuration = Math.max(
      1,
      (domainDuration * plotWidth) / MAX_CONTENT_WIDTH,
    );
    zoomDurationMs = Math.max(
      minimumDuration,
      Math.min(duration * factor, domainDuration),
    );

    await tick();
    if (!scroller || !domain) return;
    const nextLeft = Math.max(
      0,
      Math.min(
        timeToX(midpoint, domain, contentWidth) - plotWidth / 2,
        contentWidth - plotWidth,
      ),
    );
    scrollLeft = nextLeft;
    scroller.scrollLeft = nextLeft;
  }

  function fit(): void {
    zoomDurationMs = null;
    scrollLeft = 0;
    if (scroller) scroller.scrollLeft = 0;
  }
</script>

<div class="plot">
  <WorkflowTimelineIconDefs />
  <div class="controls">
    <button
      type="button"
      onclick={() => pan(-1)}
      disabled={!viewport || viewport.startMs <= (domain?.startMs ?? 0)}
      aria-label="Pan earlier">←</button
    >
    <button
      type="button"
      onclick={() => pan(1)}
      disabled={!viewport || viewport.endMs >= (domain?.endMs ?? 0)}
      aria-label="Pan later">→</button
    >
    <button
      type="button"
      onclick={() => zoom(0.5)}
      disabled={!viewport ||
        duration <=
          Math.max(1, (domainDuration * plotWidth) / MAX_CONTENT_WIDTH)}
      aria-label="Zoom in">+</button
    >
    <button
      type="button"
      onclick={() => zoom(2)}
      disabled={!viewport || duration >= domainDuration}
      aria-label="Zoom out">−</button
    >
    <button type="button" onclick={fit} disabled={zoomDurationMs === null}
      >Fit</button
    >
  </div>

  <details class="debug-panel" bind:open={isDebugOpen}>
    <summary>Debug coordinates</summary>
    {#if isDebugOpen}
      <div class="diagnostics">
        {#if domain && viewport}
          <div>
            Known: {new Date(domain.startMs).toISOString()} – {new Date(
              domain.endMs,
            ).toISOString()}
          </div>
          <div>
            Visible: {new Date(viewport.startMs).toISOString()} – {new Date(
              viewport.endMs,
            ).toISOString()}
          </div>
          <div>
            Scroll X: {Math.round(scrollLeft)}px · Plot width: {Math.round(
              plotWidth,
            )}px · Surface width: {Math.round(contentWidth)}px · Mounted rows: {visibleRows.length}/{displayedRows.length}
          </div>
          {#if inspectedRow}
            <div>
              Sample {inspectedRow.kind}
              {inspectedRow.startEventId}–{inspectedRow.endEventId}: {new Date(
                inspectedRow.startTimeMs,
              ).toISOString()} – {new Date(
                inspectedRow.endTimeMs,
              ).toISOString()} ({inspectedRow.endTimeMs < viewport.startMs ||
              inspectedRow.startTimeMs > viewport.endMs
                ? 'outside viewport'
                : 'inside viewport'})
            </div>
            <div>
              Sample X: {Math.round(
                timeToX(inspectedRow.startTimeMs, domain, contentWidth),
              )}–{Math.round(
                timeToX(inspectedRow.endTimeMs, domain, contentWidth),
              )}px on surface; visible X: {Math.round(
                timeToX(inspectedRow.startTimeMs, domain, contentWidth) -
                  scrollLeft,
              )}–{Math.round(
                timeToX(inspectedRow.endTimeMs, domain, contentWidth) -
                  scrollLeft,
              )}px
            </div>
          {/if}
        {:else}
          <div>No loaded lifecycle intervals yet.</div>
        {/if}
      </div>
    {/if}
  </details>

  <div
    class="scroller"
    role="region"
    aria-label="Workflow timeline plot"
    bind:this={scroller}
    bind:clientWidth={viewportWidth}
    bind:clientHeight={viewportHeight}
    onscroll={(event) => {
      scrollTop = event.currentTarget.scrollTop;
      scrollLeft = event.currentTarget.scrollLeft;
    }}
  >
    <div class="content" style:width={`${LABEL_WIDTH + contentWidth}px`}>
      {#if domain}
        <div class="axis">
          <div class="label" aria-hidden="true"></div>
          <div class="track">
            {#each ticks as time (time)}
              <span
                class="tick"
                style:left={`${timeToX(time, domain, contentWidth)}px`}
              >
                {new Date(time).toISOString()}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <div
        role="list"
        aria-label="Workflow timeline rows"
        class:has-time-grid={tickSpacingPx > 0}
        style:--tick-spacing={`${tickSpacingPx}px`}
        style:--tick-origin={`${tickOriginPx}px`}
        style:padding-top={`${startIndex * ROW_HEIGHT}px`}
        style:padding-bottom={`${(displayedRows.length - endIndex) * ROW_HEIGHT}px`}
      >
        {#each visibleRows as item, index (item.key)}
          {@const isCollapsed = isSceneRowCollapsed(
            item,
            collapsedKeys,
            openedChildKeys,
          )}
          {@const icon =
            item.kind === 'event'
              ? lifecycleVisuals[item.row.kind].icon
              : item.kind === 'workflow' && item.depth > 0
                ? 'relationship'
                : 'workflow'}
          <div
            role="listitem"
            aria-posinset={startIndex + index + 1}
            aria-setsize={displayedRows.length}
            class="plot-row"
            class:workflow-row={item.kind === 'workflow'}
            class:execution-row={item.kind === 'execution'}
            class:run-band={item.kind !== 'workflow' &&
              item.workflowDepth === 0}
            class:child-band={item.workflowDepth > 0}
            class:child-header={item.kind === 'workflow' &&
              item.workflowDepth > 0}
            style:--row-color={item.kind === 'event'
              ? lifecycleVisuals[item.row.kind].color
              : 'var(--color-action-workflow-workflow)'}
          >
            <div
              class="label"
              class:has-group-rail={item.kind !== 'workflow' ||
                item.workflowDepth > 0}
              class:child-rail={item.workflowDepth > 0}
              style:padding-left={`${item.depth * 1.25}rem`}
              style:--rail-width={`${Math.min(2 + item.workflowDepth * 3, 11)}px`}
            >
              {#if item.kind === 'workflow' || item.kind === 'execution'}
                <button
                  type="button"
                  class="toggle"
                  aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${item.kind}`}
                  aria-expanded={!isCollapsed}
                  onclick={() => toggleCollapsed(item)}
                  >{isCollapsed ? '▸' : '▾'}</button
                >
              {:else}
                <button
                  type="button"
                  class="jump"
                  title="Show first event on timeline"
                  aria-label={`Show first event for ${item.row.label}`}
                  disabled={!domain || contentWidth <= plotWidth}
                  onclick={() => showFirstEvent(item.row)}>⌖</button
                >
              {/if}
              <span class="row-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16">
                  <use href={`#wt-icon-${icon}`} />
                </svg>
              </span>
              <span class="label-text">
                {#if item.kind === 'workflow'}
                  Workflow {item.workflow.executions[0]?.execution.identity
                    .workflowId}
                {:else if item.kind === 'execution'}
                  Run {item.execution.execution.identity.runId}
                {:else}
                  {item.row.label}
                {/if}
              </span>
            </div>

            <div class="track">
              {#if item.kind === 'event' && viewport && domain && item.row.endTimeMs >= viewport.startMs && item.row.startTimeMs <= viewport.endMs}
                <span
                  class="interval"
                  style:left={`${Math.min(timeToX(item.row.startTimeMs, domain, contentWidth), Math.max(0, contentWidth - (item.row.startTimeMs === item.row.endTimeMs ? 2 : 0)))}px`}
                  style:width={`${timeToX(item.row.endTimeMs, domain, contentWidth) - timeToX(item.row.startTimeMs, domain, contentWidth)}px`}
                  title={`${item.row.kind}: ${new Date(item.row.startTimeMs).toISOString()} – ${new Date(item.row.endTimeMs).toISOString()}`}
                ></span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .plot {
    --rail-gutter: 18px;

    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    min-height: 0;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .controls button {
    min-width: 2rem;
  }

  .debug-panel {
    padding-inline: 0.5rem;
    font-size: 0.75rem;
  }

  .debug-panel summary {
    width: fit-content;
    padding-block: 0.25rem;
    cursor: pointer;
  }

  .diagnostics {
    overflow: hidden;
    padding: 0.5rem;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  .scroller {
    flex: 1;
    width: 100%;
    min-width: 0;
    min-height: 12rem;
    overflow: auto;
  }

  .axis,
  .plot-row {
    display: flex;
    align-items: center;
  }

  .axis {
    box-sizing: border-box;
    position: sticky;
    top: 0;
    z-index: 2;
    height: 48px;
    border-block: 1px solid currentColor;
    background: var(--color-surface-primary);
  }

  .label {
    position: sticky;
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    flex: 0 0 256px;
    align-items: center;
    align-self: stretch;
    min-width: 0;
    gap: 0.375rem;
    overflow: visible;
    padding-inline: 0.5rem;
    padding-right: calc(var(--rail-gutter) + 4px);
    background: var(
      --hover-surface,
      var(--row-surface, var(--band-surface, var(--color-surface-primary)))
    );
    white-space: nowrap;
  }

  .toggle,
  .jump {
    display: inline-flex;
    flex: 0 0 1rem;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .toggle:focus-visible,
  .jump:focus-visible {
    outline: 2px solid currentColor;
  }

  .jump:disabled {
    cursor: default;
    opacity: 0.4;
  }

  .row-icon {
    display: inline-flex;
    flex: none;
    color: var(--row-color);
  }

  .label-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .label.has-group-rail::after {
    position: absolute;
    top: 0;
    left: calc(100% - var(--rail-gutter));
    width: var(--rail-width);
    height: 32px;
    background: color-mix(in srgb, currentColor 15%, transparent);
    pointer-events: none;
    content: '';
  }

  .label.child-rail::after {
    background: color-mix(
      in srgb,
      var(--color-action-workflow-workflow) 45%,
      transparent
    );
  }

  .track {
    position: relative;
    flex: 1;
    height: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .has-time-grid .plot-row .track {
    background-image: linear-gradient(
      to right,
      color-mix(in srgb, currentColor 8%, transparent) 1px,
      transparent 1px
    );
    background-position: var(--tick-origin) 0;
    background-size: var(--tick-spacing) 100%;
  }

  .tick {
    position: absolute;
    bottom: 0;
    font-size: 0.7rem;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  .plot-row {
    box-sizing: border-box;
    height: 32px;
    border-bottom: 1px solid;
    border-color: color-mix(in srgb, currentColor 8%, transparent);
    background: var(
      --hover-surface,
      var(--row-surface, var(--band-surface, transparent))
    );
  }

  .plot-row:hover,
  .plot-row:focus-within {
    --hover-surface: color-mix(
      in srgb,
      currentColor 7%,
      var(--row-surface, var(--band-surface, var(--color-surface-primary)))
    );
  }

  .run-band {
    --band-surface: color-mix(
      in srgb,
      var(--color-action-workflow-workflow) 2%,
      var(--color-surface-primary)
    );
  }

  .child-band {
    --band-surface: color-mix(
      in srgb,
      var(--color-action-workflow-workflow) 5%,
      var(--color-surface-primary)
    );
  }

  .workflow-row {
    --row-surface: var(--color-surface-secondary);

    font-weight: 600;
  }

  .execution-row {
    --row-surface: color-mix(
      in srgb,
      var(--color-surface-secondary) 60%,
      var(--color-surface-primary)
    );

    font-weight: 500;
  }

  .child-header {
    --row-surface: color-mix(
      in srgb,
      var(--color-action-workflow-workflow) 10%,
      var(--color-surface-primary)
    );
  }

  .child-band.execution-row {
    --row-surface: color-mix(
      in srgb,
      var(--color-action-workflow-workflow) 7%,
      var(--color-surface-primary)
    );
  }

  .interval {
    position: absolute;
    top: 50%;
    height: 0.6rem;
    min-width: 2px;
    background: var(--row-color);
    border-radius: 0.3rem;
    transform: translateY(-50%);
  }
</style>

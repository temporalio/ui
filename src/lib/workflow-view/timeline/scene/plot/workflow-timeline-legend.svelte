<script lang="ts">
  import { colorScales } from '$lib/theme/io/themes';

  import { outcomeColors } from './mark-presentation';

  const outcomes = [
    { label: 'Ordinary event', color: colorScales.neutral[8] },
    { label: 'Completed', color: outcomeColors.completed },
    { label: 'Failed or terminated', color: outcomeColors.failed },
    { label: 'Timed out', color: outcomeColors.timedOut },
    { label: 'Canceled', color: outcomeColors.canceled },
    { label: 'Continued as new', color: outcomeColors.continuedAsNew },
  ];
</script>

<details
  class="legend"
  style:--workflow-color={colorScales.indigo[9]}
  style:--operation-color={colorScales.green[7]}
  style:--event-color={colorScales.neutral[8]}
>
  <summary>Legend</summary>
  <div class="popover">
    <section aria-label="Shapes">
      <h3>Shapes</h3>
      <ul class="shapes">
        <li>
          <span class="specimen" aria-hidden="true"
            ><span class="workflow"></span></span
          >
          <span>Workflow duration, divided by run</span>
        </li>
        <li>
          <span class="specimen" aria-hidden="true"
            ><span class="run"></span></span
          >
          <span>Run duration and workflow lifecycle events</span>
        </li>
        <li>
          <span class="specimen" aria-hidden="true"
            ><span class="operation"></span></span
          >
          <span>Activity, timer, or operation duration</span>
        </li>
        <li>
          <span class="specimen" aria-hidden="true">
            <span class="event"></span><span class="event outcome"></span>
          </span>
          <span
            >Lifecycle event; larger dot for an outcome or short lifecycle</span
          >
        </li>
        <li>
          <span class="specimen" aria-hidden="true"
            ><span class="diamond"></span></span
          >
          <span>Signal or update</span>
        </li>
        <li>
          <span class="specimen" aria-hidden="true"
            ><span class="marker"></span></span
          >
          <span>Recorded marker (local activity)</span>
        </li>
        <li>
          <span class="specimen cluster-specimens" aria-hidden="true">
            <span class="cluster"></span>
            <span class="cluster diamond"></span>
            <span class="cluster marker"></span>
          </span>
          <span
            >Outlined shapes group multiple events of that type; clusters
            separate when zoomed in</span
          >
        </li>
      </ul>
    </section>
    <section aria-label="Outcome colors">
      <h3>Outcome colors</h3>
      <ul class="colors">
        {#each outcomes as outcome (outcome.label)}
          <li>
            <span
              class="swatch"
              style:background-color={outcome.color}
              aria-hidden="true"
            ></span>
            <span>{outcome.label}</span>
          </li>
        {/each}
      </ul>
    </section>
    <p>
      Hover or click a mark for details. Positions reflect event timestamps.
    </p>
  </div>
</details>

<style>
  .legend {
    position: relative;
    flex: none;
    width: max-content;
    margin-left: auto;
    color: var(--color-content-primary);
    font-size: 12px;
    line-height: 1.5;
  }

  summary {
    padding: 2px 6px;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
  }

  summary:hover {
    background: var(--color-surface-secondary);
  }

  summary:focus-visible {
    outline: 2px solid var(--workflow-color);
    outline-offset: 2px;
  }

  .popover {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    z-index: 20;
    box-sizing: border-box;
    width: min(26rem, calc(100vw - 2rem));
    max-height: min(36rem, 75dvh);
    overflow: auto;
    padding: 12px;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 6px;
    background: var(--color-surface-primary, white);
    box-shadow: 0 4px 16px color-mix(in srgb, black 16%, transparent);
  }

  section + section {
    margin-top: 12px;
  }

  h3 {
    margin: 0 0 6px;
    font-size: inherit;
    font-weight: 600;
  }

  ul {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .specimen {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 36px;
    height: 16px;
  }

  .workflow,
  .run,
  .operation {
    position: relative;
    width: 32px;
    border-radius: 999px;
    background: var(--workflow-color);
  }

  .workflow {
    height: 8px;
  }

  .workflow::after {
    position: absolute;
    left: 50%;
    width: 2px;
    height: 100%;
    background: var(--color-surface-primary);
    content: '';
  }

  .run {
    height: 1px;
    background: color-mix(in srgb, var(--event-color) 25%, transparent);
  }

  .run::before,
  .run::after {
    position: absolute;
    top: -2px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--event-color);
    content: '';
  }

  .run::before {
    left: 0;
  }

  .run::after {
    right: 0;
    background: var(--workflow-color);
  }

  .operation {
    height: 5px;
    background: var(--operation-color);
  }

  .event,
  .diamond,
  .marker {
    flex: none;
    width: 6px;
    height: 6px;
    background: var(--event-color);
  }

  .event {
    border-radius: 50%;
  }

  .outcome {
    width: 10px;
    height: 10px;
  }

  .diamond {
    width: 8px;
    height: 8px;
    transform: rotate(45deg);
  }

  .cluster {
    box-sizing: border-box;
    width: 12px;
    height: 12px;
    border: 2px solid var(--workflow-color);
    border-radius: 50%;
    background: var(--color-surface-primary, white);
  }

  .cluster-specimens {
    gap: 3px;
  }

  .cluster-specimens .cluster {
    width: 9px;
    height: 9px;
  }

  .cluster.diamond,
  .cluster.marker {
    border-radius: 1px;
  }

  .colors {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .swatch {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  p {
    margin: 12px 0 0;
  }

  @media (width <= 400px) {
    .colors {
      grid-template-columns: 1fr;
    }
  }
</style>

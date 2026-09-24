<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconAwsColor,
    IconCheckmark,
    IconChevronRight,
    IconGcpColor,
    IconTemporalNamespaces,
    IconTemporalVersioning,
  } from '$lib/io/icon';
  import { colorScales } from '$lib/theme/io/themes';
  import { shortRegion } from '$lib/utilities/compute-regions';

  import {
    type PreviewRegion,
    type PreviewSlot,
    truncateMiddle,
  } from './multi-region';
  import type { Connector } from './preview-connectors';
  import {
    elbowConnector,
    pulseTiming,
    straightConnector,
  } from './preview-connectors';
  import type { ComputeProviderValue } from './shared';

  interface Props {
    namespace: string;
    provider: ComputeProviderValue;
    /** Primary first. */
    regions: readonly PreviewRegion[];
    /** What is being configured, from the form's Configuration card. */
    deploymentName?: string;
    buildId?: string;
  }

  let { namespace, provider, regions, deploymentName, buildId }: Props =
    $props();

  /** An empty Name shows the Name field's placeholder; version forms have none. */
  const displayName = $derived(
    deploymentName === undefined
      ? undefined
      : deploymentName || translate('workers.name-placeholder'),
  );

  /** Which Region the preview treats as active; failover moves it. */
  let activeIndex = $state(0);

  const multiRegion = $derived(regions.length > 1);
  const active = $derived(regions[activeIndex] ?? regions[0]);
  const primaryRegion = $derived(shortRegion(regions[0]?.regionId ?? ''));
  const shortNamespace = $derived(namespace.replace(/\.[a-z0-9]{5}$/i, ''));

  const resourceLabel = $derived(
    {
      lambda: translate('workers.preview-resource-lambda'),
      agentcore: translate('workers.preview-resource-agentcore'),
      'cloud-run': translate('workers.preview-resource-cloud-run'),
    }[provider],
  );
  const accessLabel = $derived(
    provider === 'cloud-run'
      ? translate('workers.preview-access-cloud-run')
      : translate('workers.preview-access-aws'),
  );

  const isReady = (region: PreviewRegion): boolean =>
    region.selfManaged || region.resource.state !== 'missing';

  const roleLabel = (region: PreviewRegion): string =>
    region.role === 'replica'
      ? translate('workers.region-role-replica')
      : translate('workers.region-role-primary');

  const togglePreview = () => {
    activeIndex = activeIndex === 0 ? 1 : 0;
  };

  /**
   * The path lights up from the Namespace as each step is filled in. Version
   * forms have no Name field because the deployment already exists.
   */
  const deploymentReady = $derived(
    deploymentName === undefined || deploymentName.trim() !== '',
  );
  const routeReady = $derived(deploymentReady && isReady(active));

  const trunkClass = $derived(
    deploymentReady ? 'flow' : 'text-secondary opacity-50',
  );

  /** The active path carries traffic once its resource is set; the others are on standby. */
  const isRegionLit = (index: number): boolean =>
    index === activeIndex && deploymentReady && isReady(regions[index]);

  const pathClass = (index: number): string =>
    isRegionLit(index) ? 'flow' : 'text-secondary opacity-50';

  /**
   * Diagram geometry in px. Widths, insets and gaps sit on the 12px dot grid
   * so every box edge lands on a dot.
   */
  const DIAGRAM_WIDTH = 360;
  const REGION_INSET = 12;
  const COLUMN_GAP = 24;
  const CONNECTOR_HEIGHT = 36;
  const CORNER_RADIUS = 8;
  const DEPLOYMENT_NODE_HEIGHT = 84;

  /**
   * The pulse: a near-zero dash with a round cap draws a dot, then its
   * constant speed and one cycle for every layout, so single and
   * multi-region previews pulse on the same beat.
   */
  const PULSE_DASH = 0.1;
  const PULSE_SPEED = 110;
  const PULSE_CYCLE = 3;

  const CENTER = DIAGRAM_WIDTH / 2;

  const columnCenter = (index: number): number => {
    const width =
      (DIAGRAM_WIDTH - 2 * REGION_INSET - (regions.length - 1) * COLUMN_GAP) /
      regions.length;
    return REGION_INSET + index * (width + COLUMN_GAP) + width / 2;
  };

  const trunk = straightConnector(CENTER, CONNECTOR_HEIGHT);
  const branches = $derived(
    regions.map((_, index) =>
      elbowConnector(
        CENTER,
        columnCenter(index),
        CONNECTOR_HEIGHT,
        CORNER_RADIUS,
      ),
    ),
  );

  /** SVG paints in order, so the active branch goes last to sit on top of the shared stem. */
  const branchOrder = $derived(
    [...branches.keys()].sort(
      (a, b) => Number(a === activeIndex) - Number(b === activeIndex),
    ),
  );

  /** Where the branch starts along the route: past the trunk and the node. */
  const BRANCH_START = CONNECTOR_HEIGHT + DEPLOYMENT_NODE_HEIGHT;

  const pulse = $derived(
    pulseTiming(
      BRANCH_START + (branches[activeIndex]?.length ?? 0),
      PULSE_DASH,
      PULSE_SPEED,
      PULSE_CYCLE,
    ),
  );
</script>

{#snippet pulsePath(connector: Connector, start: number)}
  <path
    d={connector.d}
    fill="none"
    stroke-width="5"
    stroke-dasharray="{PULSE_DASH} {connector.length + PULSE_DASH}"
    stroke-dashoffset={PULSE_DASH}
    class="pulse"
  >
    <animate
      attributeName="stroke-dashoffset"
      values="{PULSE_DASH};{PULSE_DASH};{-connector.length};{-connector.length}"
      keyTimes={pulse.keyTimes(start, connector.length)}
      dur="{pulse.duration}s"
      repeatCount="indefinite"
    />
  </path>
{/snippet}

{#snippet field(label: string, value: PreviewSlot)}
  <div class="flex min-w-0 flex-col text-sm">
    <span class="text-xs text-secondary">{label}</span>
    {#if value.state === 'missing'}
      <span class="truncate text-secondary">
        {translate('workers.preview-not-set')}
      </span>
    {:else if value.state === 'inherited'}
      <span class="truncate text-primary">
        {translate('workers.preview-same-as')}
        <span class="font-medium">{primaryRegion}</span>
      </span>
    {:else}
      <span
        class="text-primary [overflow-wrap:anywhere]"
        title={value.full ?? value.value}
      >
        {value.value}
      </span>
    {/if}
  </div>
{/snippet}

{#snippet mark(state: PreviewSlot['state'])}
  <span class="inline-flex size-4 shrink-0 items-center justify-center">
    {#if state === 'missing'}
      <span class="size-2.5 rounded-full border border-secondary"></span>
    {:else}
      <IconCheckmark
        width={14}
        height={14}
        class={state === 'set' ? 'text-success' : 'text-secondary'}
      />
    {/if}
  </span>
{/snippet}

<aside
  class="mb-4 min-[1180px]:absolute min-[1180px]:inset-y-0 min-[1180px]:left-[calc(100%+1.5rem)] min-[1180px]:mb-0 min-[1180px]:w-[388px]"
  aria-label={translate('workers.preview-title')}
>
  <div
    class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-surface-secondary px-4 py-2 text-sm min-[1180px]:hidden"
  >
    {#each regions as region (region.regionId)}
      <span class="inline-flex items-center gap-1.5">
        {@render mark(isReady(region) ? 'set' : 'missing')}
        <span class="font-medium text-primary"
          >{shortRegion(region.regionId)}</span
        >
        {#if region.selfManaged}
          <span class="text-secondary">
            {translate('workers.preview-own-workers')}
          </span>
        {:else if region.resource.state !== 'missing'}
          <span class="text-secondary">{region.resource.value}</span>
        {/if}
      </span>
    {/each}
  </div>

  <div
    class="hidden overflow-hidden rounded-lg border border-primary bg-surface-secondary p-4 min-[1180px]:sticky min-[1180px]:top-4 min-[1180px]:block"
  >
    <h3 class="text-base font-medium">
      {translate('workers.preview-title')}
    </h3>
    <p class="text-sm text-secondary">
      {translate('workers.preview-description')}
    </p>

    <div
      class="mt-4 h-px bg-gradient-to-r from-transparent via-[var(--color-border-primary)] to-transparent"
      aria-hidden="true"
    ></div>

    <div
      class="diagram-grid relative -mx-4 px-[13px] pb-6 pt-[19px] text-sm {multiRegion
        ? ''
        : '-mb-4'}"
      style:--green-2={colorScales.green[2]}
      style:--green-5={colorScales.green[5]}
      style:--green-6={colorScales.green[6]}
      style:--green-8={colorScales.green[8]}
      style:--green-9={colorScales.green[9]}
    >
      <div class="flex justify-center">
        <div
          class="neon-box flex w-[168px] min-w-0 max-w-full flex-col items-stretch rounded-lg border border-primary bg-surface-primary"
        >
          <span
            class="inline-flex h-[41px] w-full items-center gap-1.5 border-b border-primary px-2.5 font-medium text-primary"
          >
            <span
              class="inline-flex size-5 shrink-0 items-center justify-center rounded border border-primary bg-surface-primary"
            >
              <IconTemporalNamespaces
                width={14}
                height={14}
                class="text-secondary"
              />
            </span>
            {translate('workers.preview-namespace')}
          </span>
          <span
            class="block h-[41px] max-w-full truncate px-2.5 leading-[41px] text-secondary"
            >{shortNamespace}</span
          >
        </div>
      </div>

      <svg
        class="block w-full"
        style:height="{CONNECTOR_HEIGHT}px"
        viewBox="0 0 {DIAGRAM_WIDTH} {CONNECTOR_HEIGHT}"
        aria-hidden="true"
      >
        <path
          d={trunk.d}
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          class={trunkClass}
        />
        {#if routeReady}
          {@render pulsePath(trunk, 0)}
        {/if}
      </svg>

      <div class="flex justify-center">
        <div
          class="flex w-72 min-w-0 max-w-full flex-col items-stretch rounded-lg border border-primary bg-surface-primary transition-[border-color,box-shadow]"
          class:neon-box={deploymentReady}
        >
          <span
            class="inline-flex h-[41px] w-full items-center gap-1.5 border-b border-primary px-2.5 font-medium text-primary"
          >
            <span
              class="inline-flex size-5 shrink-0 items-center justify-center rounded border border-primary bg-surface-primary"
            >
              <IconTemporalVersioning
                width={14}
                height={14}
                class="text-secondary"
              />
            </span>
            {translate('workers.preview-worker-deployment')}
          </span>
          {#if displayName || buildId}
            <span
              class="flex h-[41px] min-w-0 max-w-full items-center gap-1 px-2.5 text-secondary"
            >
              {#if displayName}
                <span class="truncate" class:italic={!deploymentName}
                  >{displayName}</span
                >
              {/if}
              {#if displayName && buildId}
                <IconChevronRight
                  width={12}
                  height={12}
                  class="shrink-0 text-secondary"
                />
              {/if}
              {#if buildId}
                <span class="shrink-0" title={buildId}
                  >{truncateMiddle(buildId, 12)}</span
                >
              {/if}
            </span>
          {:else}
            <span class="block h-[41px] px-2.5 leading-[41px] text-secondary"
              >{translate('workers.preview-not-set')}</span
            >
          {/if}
        </div>
      </div>

      <svg
        class="block w-full"
        style:height="{CONNECTOR_HEIGHT}px"
        viewBox="0 0 {DIAGRAM_WIDTH} {CONNECTOR_HEIGHT}"
        aria-hidden="true"
      >
        {#each branchOrder as index (index)}
          <path
            d={branches[index].d}
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            class={pathClass(index)}
          />
        {/each}
        {#if routeReady && branches[activeIndex]}
          {@render pulsePath(branches[activeIndex], BRANCH_START)}
        {/if}
      </svg>

      <div
        class="grid gap-6 px-3"
        style="grid-template-columns: repeat({regions.length}, minmax(0, 1fr));"
      >
        {#each regions as region, index (region.regionId)}
          {@const isActive = index === activeIndex}
          {@const isLit = isRegionLit(index)}
          {@const CloudIcon = region.regionId.startsWith('gcp')
            ? IconGcpColor
            : IconAwsColor}
          <div
            class="flex min-w-0 flex-col rounded-lg border border-primary bg-surface-primary transition-[border-color,box-shadow]"
            class:neon-box={isLit}
          >
            <div
              class="flex flex-col justify-center gap-0.5 border-b border-primary px-2.5"
              class:h-[41px]={!multiRegion}
              class:h-[59px]={multiRegion}
            >
              <span class="inline-flex items-center gap-1.5">
                <span
                  class="inline-flex size-5 shrink-0 items-center justify-center rounded border border-primary bg-surface-primary"
                >
                  <CloudIcon width={16} height={16} />
                </span>
                <span class="whitespace-nowrap font-medium text-primary">
                  {shortRegion(region.regionId)}
                </span>
              </span>
              {#if multiRegion}
                <span
                  class="inline-flex items-center gap-1 pl-[26px] text-xs text-secondary"
                >
                  {roleLabel(region)}
                  {#if isActive}
                    <span class="sr-only">
                      ({translate('workers.preview-active')})
                    </span>
                  {/if}
                </span>
              {/if}
            </div>
            <div
              class="flex min-w-0 flex-col justify-start gap-1 px-2.5"
              class:min-h-[113px]={!multiRegion}
              class:py-3={!multiRegion}
              class:min-h-[107px]={multiRegion}
              class:py-[9px]={multiRegion}
            >
              {#if region.selfManaged}
                {@render field(translate('workers.preview-workers'), {
                  value: translate('workers.preview-own-workers'),
                  state: 'set',
                })}
              {:else}
                {@render field(resourceLabel, region.resource)}
                <div class="my-1 border-t border-primary"></div>
                {@render field(accessLabel, region.access)}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    {#if multiRegion}
      <div
        class="h-px bg-gradient-to-r from-transparent via-[var(--color-border-primary)] to-transparent"
        aria-hidden="true"
      ></div>
      <Button variant="tertiary" size="sm" class="mt-4" onclick={togglePreview}>
        {activeIndex === 0
          ? translate('workers.preview-failover')
          : translate('workers.preview-failback')}
      </Button>
    {/if}
  </div>
</aside>

<style>
  /*
   * The dot grid from Temporal Cloud's home page sits behind the diagram.
   * Io green ramp steps are shared by the active line, the pulse and the
   * glow around lit nodes, so the path reads as one lit circuit. Dark mode
   * takes the saturated middle of the ramp, since the pale end washes out on
   * a dark surface.
   */
  .diagram-grid {
    isolation: isolate;
    --glow: var(--green-6);
    --glow-core: var(--green-2);
    --glow-halo: var(--green-8);
  }

  .diagram-grid::before {
    content: '';
    position: absolute;
    inset: 6px;
    z-index: -1;
    pointer-events: none;
    background-image: linear-gradient(
      to bottom right,
      var(--color-border-secondary),
      var(--color-border-tertiary)
    );
    mask-image: radial-gradient(circle at 1px 1px, #000 1px, transparent 0);
    mask-size: 12px 12px;

    /* A dot column on the center line, rows from the top, margin at every edge. */
    mask-position: calc(50% + 5px) 0;
  }

  :global([data-theme='dark']) .diagram-grid {
    --glow: var(--green-9);
    --glow-core: var(--green-5);
    --glow-halo: var(--green-8);
  }

  .flow {
    stroke: var(--glow);
    filter: drop-shadow(
      0 0 1.5px color-mix(in srgb, var(--glow) 30%, transparent)
    );
  }

  /* A softer border than the line, the way Io success borders take alpha. */
  .neon-box {
    border-color: color-mix(in srgb, var(--glow) 60%, transparent);
    box-shadow: 0 0 16px -2px color-mix(in srgb, var(--glow) 45%, transparent);
  }

  /*
   * A bright dot that travels down the active path at one constant speed,
   * Namespace first, then on to the active Region.
   */
  .pulse {
    stroke: var(--glow-core);
    filter: drop-shadow(0 0 2px var(--glow-halo))
      drop-shadow(0 0 5px color-mix(in srgb, var(--glow) 50%, transparent));
    stroke-linecap: round;
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse {
      display: none;
    }
  }
</style>

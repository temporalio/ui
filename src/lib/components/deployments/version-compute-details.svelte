<script lang="ts">
  import {
    COMPUTE_PROVIDER_VALUES,
    COMPUTE_PROVIDERS,
  } from '$lib/components/workers/serverless-worker-form/compute-providers';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { decodeScalerDetails } from '$lib/services/deployments-service';
  import type { ComputeConfig } from '$lib/types/deployments';
  import {
    formatDurationMs,
    getScalingGroups,
    hasRegionScopedGroups,
    type NamespaceRegion,
  } from '$lib/utilities/compute-regions';

  let {
    computeConfig,
    namespaceRegions = [],
  }: {
    computeConfig: ComputeConfig | undefined;
    namespaceRegions?: readonly NamespaceRegion[];
  } = $props();

  /**
   * A group's column, named as the form names it. The unscoped group is the
   * primary; a scoped group takes the role of the Namespace region it names.
   * Without the Namespace's regions, the group's own regions are shown.
   */
  const groupHeading = (
    regionIds: string[],
  ): { region: string; role?: string } => {
    const region = regionIds.length
      ? namespaceRegions.find(({ regionId }) => regionIds.includes(regionId))
      : namespaceRegions.find(({ role }) => role === 'primary');
    if (!region) {
      return {
        region: regionIds.length
          ? regionIds.join(', ')
          : translate('workers.region-all'),
      };
    }
    return {
      region: region.label ?? region.regionId,
      role:
        region.role === 'replica'
          ? translate('workers.region-role-replica')
          : translate('workers.region-role-primary'),
    };
  };

  /** Header cell of the parent table's Region column, when there is one. */
  const REGION_HEADER = 'thead th:nth-child(3)';

  let table = $state<HTMLTableElement>();
  /**
   * Width of the label column, so the first Region's values start where the
   * parent table's Region header text starts. Falls back to 12rem.
   */
  let labelWidth = $state<number>();

  $effect(() => {
    if (!table) return;
    const own = table;
    const header = own.parentElement
      ?.closest('table')
      ?.querySelector<HTMLElement>(REGION_HEADER);
    if (!header) return;
    const measure = () => {
      const padding = parseFloat(getComputedStyle(header).paddingLeft) || 0;
      const cell = own.querySelector('td');
      const cellPadding = cell
        ? parseFloat(getComputedStyle(cell).paddingLeft) || 0
        : 0;
      labelWidth =
        header.getBoundingClientRect().left +
        padding -
        cellPadding -
        own.getBoundingClientRect().left;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(own);
    return () => observer.disconnect();
  });

  /**
   * Every field (resource, access, scaling) is per scaling group. Decode one
   * group at a time so a multi-region version shows every group, not just the
   * first.
   */
  const perGroup = $derived(
    getScalingGroups(computeConfig).map(
      ({ name, regionIds, providerType, group }) => {
        const single: ComputeConfig = { scalingGroups: { [name]: group } };
        // The provider says what it saved. Nothing here names a provider, so
        // adding one cannot leave this rendering an empty panel.
        const definition = COMPUTE_PROVIDER_VALUES.map(
          (value) => COMPUTE_PROVIDERS[value],
        ).find((candidate) => candidate.providerType === providerType);

        return {
          name,
          regionIds,
          providerType,
          details: definition?.details(single) ?? [],
          scaler: decodeScalerDetails(single),
        };
      },
    ),
  );

  const isMultiRegion = $derived(hasRegionScopedGroups(computeConfig));

  // Anything the provider said it saved. Previously a hand-written list of
  // every provider's marker field, which is what made a Modal Version render
  // an empty panel.
  const isCompute = $derived(
    perGroup.some((r) => r.details.some(({ value }) => !!value)),
  );

  type Cell = { text: string; full?: string };
  type Row = { label: string; cells: (Cell | undefined)[] };

  const resource = (full: string | undefined): Cell | undefined =>
    full ? { text: full, full } : undefined;
  const plain = (text: string | undefined): Cell | undefined =>
    text ? { text } : undefined;
  const duration = (ms: number | undefined): Cell | undefined =>
    ms === undefined ? undefined : { text: formatDurationMs(ms) };

  /** One row per setting, one cell per scaling group; empty rows are dropped. */
  const rows = $derived.by((): Row[] => {
    const row = (
      label: string,
      cell: (group: (typeof perGroup)[number]) => Cell | undefined,
    ): Row => ({ label, cells: perGroup.map(cell) });

    // One row per label any group declared, in the order the providers list
    // them, so a multi-region version with different providers per region
    // still lines its settings up.
    const labelKeys = [
      ...new Set(perGroup.flatMap((g) => g.details.map((d) => d.labelKey))),
    ];

    return [
      ...labelKeys.map((labelKey) =>
        row(translate(labelKey), (g) => {
          const detail = g.details.find((d) => d.labelKey === labelKey);
          if (!detail?.value) return undefined;
          return detail.truncate ? resource(detail.value) : plain(detail.value);
        }),
      ),
      row(translate('deployments.scale-up-cooloff'), (g) =>
        duration(g.scaler.scaleUpCooloffMs),
      ),
      row(translate('deployments.backlog-threshold'), (g) =>
        g.scaler.scaleUpBacklogThreshold === undefined
          ? undefined
          : { text: `${g.scaler.scaleUpBacklogThreshold}` },
      ),
      row(translate('deployments.max-worker-lifetime'), (g) =>
        duration(g.scaler.maxWorkerLifetimeMs),
      ),
      row(translate('deployments.metrics-poll-interval'), (g) =>
        duration(g.scaler.metricsPollIntervalMs),
      ),
    ].filter(({ cells }) => cells.some(Boolean));
  });
</script>

{#snippet value(cell: Cell | undefined)}
  {#if cell?.full}
    <!-- The 24px copy button would otherwise make these rows taller. -->
    <Copyable
      container-class="-my-1 min-w-0"
      content={cell.full}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
    >
      <span class="block truncate" title={cell.full}>{cell.text}</span>
    </Copyable>
  {:else if cell}
    {cell.text}
  {:else}
    <span class="text-secondary">{translate('workers.preview-not-set')}</span>
  {/if}
{/snippet}

{#if isCompute}
  <div class="bg-surface-secondary py-3 text-xs">
    <div class="px-4">
      <table bind:this={table} class="w-full table-fixed">
        {#if isMultiRegion}
          <thead>
            <tr>
              <th
                class="pb-2 pl-2"
                class:w-48={labelWidth === undefined}
                style:width={labelWidth === undefined
                  ? undefined
                  : `${labelWidth}px`}
              ></th>
              {#each perGroup as group (group.name)}
                {@const heading = groupHeading(group.regionIds)}
                <th class="pb-2 pl-2 text-left font-normal">
                  <span class="flex items-center gap-1.5">
                    <span class="font-medium text-primary">
                      {heading.region}
                    </span>
                    {#if heading.role}
                      <span class="text-secondary" aria-hidden="true">·</span>
                      <span class="text-secondary">{heading.role}</span>
                    {/if}
                  </span>
                </th>
              {/each}
            </tr>
          </thead>
        {/if}
        <tbody class="divide-y divide-primary">
          {#each rows as row (row.label)}
            <tr>
              <th
                scope="row"
                class="py-1.5 pl-2 pr-4 text-left font-normal text-secondary"
                class:w-48={labelWidth === undefined}
                style:width={labelWidth === undefined
                  ? undefined
                  : `${labelWidth}px`}
              >
                {row.label}
              </th>
              {#each row.cells as cell, index (index)}
                <td class="py-1.5 pl-2 pr-4 text-primary">
                  {@render value(cell)}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

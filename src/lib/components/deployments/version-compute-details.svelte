<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    decodeAgentCoreProviderDetails,
    decodeGcpCloudRunProviderDetails,
    decodeLambdaProviderDetails,
    decodeScalerDetails,
  } from '$lib/services/deployments-service';
  import type { ComputeConfig } from '$lib/types/deployments';
  import {
    formatDurationMs,
    getScalingGroups,
    isMultiRegionConfig,
    shortRegion,
  } from '$lib/utilities/compute-regions';

  let { computeConfig }: { computeConfig: ComputeConfig | undefined } =
    $props();

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
      labelWidth =
        header.getBoundingClientRect().left +
        padding -
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
      ({ name, regionId, providerType, group }) => {
        const single: ComputeConfig = { scalingGroups: { [name]: group } };
        const lambda = decodeLambdaProviderDetails(single);
        const agentCore = decodeAgentCoreProviderDetails(single);
        return {
          name,
          regionId,
          providerType,
          lambda,
          agentCore,
          gcp: decodeGcpCloudRunProviderDetails(single),
          scaler: decodeScalerDetails(single),
          // Lambda and AgentCore share the assumed-role fields; only one decodes.
          iamRoleArn: lambda.iamRoleArn ?? agentCore.iamRoleArn,
          roleExternalId: lambda.roleExternalId ?? agentCore.roleExternalId,
        };
      },
    ),
  );

  const isMultiRegion = $derived(isMultiRegionConfig(computeConfig));

  const isCompute = $derived(
    perGroup.some(
      (r) =>
        !!r.lambda.lambdaArn ||
        !!r.agentCore.agentCoreEndpointArn ||
        !!r.gcp.gcpWorkerPool,
    ),
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
    return [
      row(translate('workers.preview-resource-lambda'), (g) =>
        resource(g.lambda.lambdaArn),
      ),
      row(translate('workers.preview-resource-agentcore'), (g) =>
        resource(g.agentCore.agentCoreEndpointArn),
      ),
      row(translate('workers.gcp-worker-pool-label'), (g) =>
        resource(g.gcp.gcpWorkerPool),
      ),
      row(translate('workers.gcp-project-label'), (g) =>
        plain(g.gcp.gcpProject),
      ),
      row(translate('workers.gcp-region-label'), (g) => plain(g.gcp.gcpRegion)),
      row(translate('workers.preview-access-aws'), (g) =>
        resource(g.iamRoleArn),
      ),
      row(translate('workers.gcp-service-account-label'), (g) =>
        resource(g.gcp.gcpServiceAccount),
      ),
      row(translate('deployments.role-external-id'), (g) =>
        g.roleExternalId
          ? { text: g.roleExternalId, full: g.roleExternalId }
          : undefined,
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
    <div class="pl-6 pr-4">
      <table bind:this={table} class="w-full table-fixed">
        {#if isMultiRegion}
          <thead>
            <tr>
              <th
                class="pb-2"
                class:w-48={labelWidth === undefined}
                style:width={labelWidth === undefined
                  ? undefined
                  : `${labelWidth}px`}
              ></th>
              {#each perGroup as group (group.name)}
                <th class="pb-2 text-left font-normal">
                  <span class="flex items-center gap-1.5">
                    <span class="font-medium text-primary">
                      {group.regionId
                        ? shortRegion(group.regionId)
                        : translate('workers.region-all')}
                    </span>
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
                class="py-1.5 pr-4 text-left font-normal text-secondary"
                class:w-48={labelWidth === undefined}
                style:width={labelWidth === undefined
                  ? undefined
                  : `${labelWidth}px`}
              >
                {row.label}
              </th>
              {#each row.cells as cell, index (index)}
                <td class="py-1.5 pr-4 text-primary">
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

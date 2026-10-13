<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    isVersionSummaryNew,
    type RoutingConfig,
    type VersionSummary,
  } from '$lib/types/deployments';
  import type { NamespaceRegion } from '$lib/utilities/compute-regions';
  import {
    versionComputeProviderType,
    versionShowsConnectionStatus,
  } from '$lib/utilities/connection-status';
  import {
    parseVersionStatus,
    versionRouting,
    versionStatus,
  } from '$lib/utilities/deployments';
  import { getDeploymentVersionFromStruct } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForWorkerDeploymentVersionEdit,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';
  import { versionDetailsHref } from '$lib/utilities/version-details';

  import DeploymentStatus from './deployment-status.svelte';
  import VersionActionsMenu from './version-actions-menu.svelte';
  import VersionActions from './version-actions.svelte';
  import VersionRegions from './version-regions.svelte';

  interface Props {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    namespace: string;
    deploymentName: string;
    conflictToken?: string;
    showConnectionStatus?: boolean;
    /** Regions the namespace runs in, so unconfigured Regions are surfaced. */
    namespaceRegions?: readonly NamespaceRegion[];
    onChange?: () => void;
    onValidationComplete?: () => void;
  }
  let {
    routingConfig,
    version,
    namespace,
    deploymentName,
    conflictToken,
    showConnectionStatus = true,
    namespaceRegions,
    onChange,
    onValidationComplete,
  }: Props = $props();

  const routing = $derived(versionRouting(version, routingConfig));
  const versionBuildId = $derived(routing.buildId);
  const { status, label: statusLabel } = $derived(
    versionStatus(version, routingConfig),
  );

  const computeProviderType = $derived(versionComputeProviderType(version));

  const connectionVisible = $derived(
    versionShowsConnectionStatus(version, routingConfig),
  );

  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeploymentVersion="${getDeploymentVersionFromStruct(version)}"`,
    }) ?? '',
  );

  const editHref = $derived(
    routeForWorkerDeploymentVersionEdit({
      namespace,
      deployment: routing.deploymentName,
      buildId: versionBuildId,
    }),
  );

  const detailsHref = $derived(versionDetailsHref(page.url, versionBuildId));

  const canRampToVersion = $derived(
    parseVersionStatus(isVersionSummaryNew(version) ? version.status : '')
      .status !== 'Created',
  );

  let actions = $state<VersionActions>();
</script>

<tr class="[&>td]:align-middle">
  <td class="text-left">
    <Copyable
      content={versionBuildId}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
    >
      <Link href={detailsHref} data-sveltekit-noscroll data-sveltekit-keepfocus>
        {versionBuildId}
      </Link>
    </Copyable>
  </td>
  <td class="text-left">
    <DeploymentStatus {status} label={statusLabel} appearance="badge" />
  </td>
  <td class="text-left">
    {#if isVersionSummaryNew(version) && computeProviderType}
      <VersionRegions
        computeConfig={version.computeConfig}
        {namespaceRegions}
        computeStatus={version.computeStatus}
        showConnectionStatus={showConnectionStatus && connectionVisible}
      />
    {:else}
      <span class="text-secondary">—</span>
    {/if}
  </td>
  <Timestamp
    as="td"
    class="whitespace-pre-line break-words text-left"
    dateTime={version?.createTime}
  />
  <VersionActionsMenu
    buildId={versionBuildId}
    {detailsHref}
    {editHref}
    {workflowHref}
    isCurrent={routing.isCurrent}
    hasComputeConfig={isVersionSummaryNew(version)
      ? Object.keys(version.computeConfig?.scalingGroups ?? {}).length > 0
      : false}
    isRamping={routing.isRamping}
    onSetCurrent={() => actions?.setCurrent()}
    onSetRamping={() => actions?.setRamping()}
    onUnsetCurrent={() => actions?.unsetCurrent()}
    onValidate={() => actions?.validate()}
    onDelete={() => actions?.remove()}
  />
</tr>

<VersionActions
  bind:this={actions}
  {namespace}
  {deploymentName}
  buildId={versionBuildId}
  {routingConfig}
  {conflictToken}
  canRamp={canRampToVersion}
  {onChange}
  {onValidationComplete}
/>

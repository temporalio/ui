<script lang="ts">
  import { writable } from 'svelte/store';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { Menu, MenuContainer, MenuItem } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { decodeLambdaProviderDetails } from '$lib/services/deployments-service';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import {
    isVersionSummaryNew,
    type RoutingConfig,
    type VersionSummary,
  } from '$lib/types/deployments';
  import {
    getBuildIdFromVersion,
    getDeploymentFromVersion,
    getDeploymentVersionFromStruct,
  } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForWorkerDeploymentVersionEdit,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import DeploymentStatus from './deployment-status.svelte';

  type Props = {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    columns: ConfigurableTableHeader[];
    namespace: string;
  };
  let { routingConfig, version, columns, namespace }: Props = $props();

  const currentDeploymentName = $derived(
    routingConfig.currentDeploymentVersion?.deploymentName,
  );
  const currentBuildId = $derived(
    routingConfig.currentDeploymentVersion?.buildId,
  );

  const rampingDeploymentName = $derived(
    routingConfig.rampingDeploymentVersion?.deploymentName,
  );
  const rampingBuildId = $derived(
    routingConfig.rampingDeploymentVersion?.buildId,
  );

  const versionDeploymentName = $derived(
    isVersionSummaryNew(version)
      ? version.deploymentVersion.deploymentName
      : getDeploymentFromVersion(version.version),
  );
  const versionBuildId = $derived(
    isVersionSummaryNew(version)
      ? version.deploymentVersion.buildId
      : getBuildIdFromVersion(version.version),
  );

  const isCurrent = $derived(
    versionDeploymentName === currentDeploymentName &&
      versionBuildId === currentBuildId,
  );
  const isRamping = $derived(
    versionDeploymentName === rampingDeploymentName &&
      versionBuildId === rampingBuildId,
  );
  const drainageStatus = $derived(
    isVersionSummaryNew(version) ? version.status : version.drainageStatus,
  );
  const statusEnum = $derived(
    isVersionSummaryNew(version)
      ? 'WorkerDeploymentVersionStatus'
      : 'VersionDrainageStatus',
  );

  const status = $derived(
    isCurrent
      ? translate('deployments.current')
      : isRamping
        ? translate('deployments.ramping')
        : drainageStatus
          ? fromScreamingEnum(drainageStatus, statusEnum)
          : translate('common.inactive'),
  ) as Status;

  const statusLabel = $derived(
    isCurrent
      ? translate('deployments.current')
      : isRamping
        ? translate('deployments.ramping-percentage', {
            percentage: routingConfig.rampingVersionPercentage,
          })
        : drainageStatus
          ? fromScreamingEnum(drainageStatus, statusEnum)
          : translate('common.inactive'),
  );

  const computeProviderType = $derived(
    isVersionSummaryNew(version) && version.computeConfig
      ? Object.values(version.computeConfig.scalingGroups ?? {})[0]?.provider
          ?.type
      : undefined,
  );

  const providerDetails = $derived(
    isVersionSummaryNew(version)
      ? decodeLambdaProviderDetails(version.computeConfig)
      : {},
  );

  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeploymentVersion="${getDeploymentVersionFromStruct(version)}"`,
    }),
  );

  const editHref = $derived(
    routeForWorkerDeploymentVersionEdit({
      namespace,
      deployment: versionDeploymentName,
      buildId: versionBuildId,
    }),
  );

  let expanded = $state(false);
  const menuOpen = writable(false);
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.build-id')}
      <td class="text-left">
        <div class="flex items-center gap-1">
          <button
            type="button"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onclick={() => (expanded = !expanded)}
            class="shrink-0"
          >
            <Icon
              name="chevron-right"
              class="h-4 w-4 transition-transform {expanded ? 'rotate-90' : ''}"
            />
          </button>
          <Copyable
            content={versionBuildId}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          >
            <Link href={workflowHref}>
              {versionBuildId}
            </Link>
          </Copyable>
        </div>
      </td>
    {:else if label === translate('deployments.status')}
      <td class="text-left">
        <div class="flex items-center gap-2">
          <DeploymentStatus {status} label={statusLabel} />
          {#if isCurrent && isVersionSummaryNew(version) && version?.currentSinceTime}
            Since <Timestamp dateTime={version.currentSinceTime} />
          {:else if isRamping && isVersionSummaryNew(version) && version?.rampingSinceTime}
            Since <Timestamp dateTime={version.rampingSinceTime} />
          {/if}
        </div>
      </td>
    {:else if label === translate('deployments.compute')}
      <td class="text-left">
        {#if computeProviderType}
          <span class="text-sm capitalize">{computeProviderType}</span>
        {:else}
          <span class="text-secondary">—</span>
        {/if}
      </td>
    {:else if label === translate('deployments.deployed')}
      <Timestamp
        as="td"
        class="whitespace-pre-line break-words text-left"
        dateTime={version?.createTime}
      />
    {:else if label === translate('deployments.actions')}
      <td class="w-24 whitespace-pre-line break-words">
        <MenuContainer open={menuOpen}>
          {#snippet children(open)}
            <button
              type="button"
              aria-label="Actions"
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls="version-actions-{versionBuildId}"
              onclick={() => menuOpen.update((v) => !v)}
              class="flex h-8 w-8 items-center justify-center rounded hover:surface-interactive-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              <Icon name="vertical-ellipsis" class="h-4 w-4" />
            </button>
            <Menu id="version-actions-{versionBuildId}" position="right">
              <MenuItem href={editHref}>
                {translate('deployments.edit-version')}
              </MenuItem>
              <MenuItem href={workflowHref}>
                {translate('deployments.go-to-workflows')}
              </MenuItem>
            </Menu>
          {/snippet}
        </MenuContainer>
      </td>
    {/if}
  {/each}
</tr>

{#if expanded}
  <tr class="surface-primary">
    <td colspan={columns.length} class="px-4 pb-3 pt-1">
      <div class="flex flex-col gap-2 text-sm">
        {#if providerDetails.lambdaArn}
          <div class="flex items-center gap-2">
            <span class="w-28 shrink-0 text-secondary"
              >{translate('workers.lambda-arn-label')}</span
            >
            <code class="text-xs">{providerDetails.lambdaArn}</code>
          </div>
        {/if}
        {#if providerDetails.iamRoleArn}
          <div class="flex items-center gap-2">
            <span class="w-28 shrink-0 text-secondary"
              >{translate('workers.iam-role-label')}</span
            >
            <code class="text-xs">{providerDetails.iamRoleArn}</code>
          </div>
        {/if}
        {#if !providerDetails.lambdaArn && !providerDetails.iamRoleArn}
          <span class="text-secondary">{translate('common.no-results')}</span>
        {/if}
      </div>
    </td>
  </tr>
{/if}

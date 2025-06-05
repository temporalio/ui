<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { RoutingConfig, VersionSummary } from '$lib/types/deployments';
  import type { DeploymentStatus as Status } from '$lib/types/deployments';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import DeploymentStatus from './deployment-status.svelte';

  type Props = {
    routingConfig: RoutingConfig;
    version: VersionSummary;
    columns: ConfigurableTableHeader[];
  };
  let { routingConfig, version, columns }: Props = $props();

  const isCurrent = $derived(version.version === routingConfig.currentVersion);
  const isRamping = version.version === routingConfig.rampingVersion;
  const drainageStatus = version.drainageStatus;

  const status = $derived(
    isCurrent
      ? translate('deployments.current')
      : isRamping
        ? translate('deployments.ramping')
        : drainageStatus
          ? fromScreamingEnum(drainageStatus, 'VersionDrainageStatus')
          : translate('common.inactive'),
  ) as Status;

  const statusLabel = $derived(
    isCurrent
      ? translate('deployments.current')
      : isRamping
        ? translate('deployments.ramping', {
            percentage: routingConfig.rampingVersionPercentage,
          })
        : drainageStatus
          ? fromScreamingEnum(drainageStatus, 'VersionDrainageStatus')
          : translate('common.inactive'),
  );
</script>

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('deployments.version')}
      <td class="p-2 text-left">
        <DeploymentStatus
          {status}
          version={version.version}
          label={statusLabel}
        />
      </td>
    {:else if label === translate('deployments.deployed')}
      <td class="whitespace-pre-line break-words p-2 text-left"
        >{formatDate(version?.createTime, $timeFormat, {
          relative: $relativeTime,
        })}</td
      >
    {:else if label === translate('deployments.workflows')}
      <td class="whitespace-pre-line break-words p-2 text-center"
        ><p>
          <Link
            icon="external-link"
            href={routeForWorkflowsWithQuery({
              namespace: $page.params.namespace,
              query: `TemporalWorkerDeploymentVersion="${version.version}"`,
            })}
          />
        </p></td
      >
    {/if}
  {/each}
</tr>

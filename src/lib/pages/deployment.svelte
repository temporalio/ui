<script module lang="ts">
  type DeploymentRefreshResult<T, Key = string> =
    | { key: Key; deployment: T; error?: never }
    | { key: Key; deployment?: never; error: unknown };

  type DeploymentRefreshState<T, Key = string> = {
    deployment?: { key: Key; deployment: T };
    error?: { key: Key; error: unknown };
  };

  export const updateDeploymentRefreshState = <T, Key = string>(
    state: DeploymentRefreshState<T, Key>,
    result: DeploymentRefreshResult<T, Key>,
  ): DeploymentRefreshState<T, Key> => {
    if ('error' in result) {
      return { ...state, error: { key: result.key, error: result.error } };
    }
    return { deployment: result };
  };

  export const isCurrentDeploymentRoute = (
    resultRoute: { instance: symbol },
    currentRoute: { instance: symbol },
  ): boolean => resultRoute.instance === currentRoute.instance;

  export const createLatestDeploymentRefresher = <T, Key = string>(
    load: (key: Key) => Promise<T>,
    getCurrentKey: () => Key,
    apply: (result: DeploymentRefreshResult<T, Key>) => void,
  ): (() => Promise<void>) => {
    let latestRequest = 0;

    return async () => {
      const request = ++latestRequest;
      const key = getCurrentKey();

      try {
        const deployment = await load(key);
        if (request !== latestRequest || key !== getCurrentKey()) return;
        apply({ key, deployment });
      } catch (error) {
        if (request !== latestRequest || key !== getCurrentKey()) return;
        apply({ key, error });
      }
    };
  };

  export const scheduleConnectionStatusRefreshes = (
    onChange: () => void,
    scheduledRefreshes: number[],
  ): number[] => {
    scheduledRefreshes.forEach(clearTimeout);
    onChange();
    return [1_000, 3_000].map((delay) => window.setTimeout(onChange, delay));
  };
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import DeleteDeploymentModal from '$lib/components/deployments/delete-deployment-modal.svelte';
  import DeploymentHeader from '$lib/components/deployments/deployment-header.svelte';
  import RampUnversionedModal from '$lib/components/deployments/ramp-unversioned-modal.svelte';
  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Error from '$lib/holocene/error.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeployment,
    fetchDeployment,
    removeRampingUnversionedWorkers,
    setRampingUnversionedWorkers,
  } from '$lib/services/deployments-service';
  import type { WorkerDeploymentResponse } from '$lib/types/deployments';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  interface Props {
    showInstancesLink?: boolean;
  }

  let { showInstancesLink = true }: Props = $props();

  const { namespace } = $derived(page.params);
  const deploymentName = $derived(decodeURIForSvelte(page.params.deployment));

  // fetchDeployment lives here rather than in +page.ts because it requires a
  // server-relative base URL that isn't available at import time for package
  // consumers.
  const deploymentRoute = $derived.by(() => ({
    key: `${namespace}\u0000${deploymentName}`,
    instance: Symbol(),
    namespace,
    deploymentName,
    initialPromise: fetchDeployment({ namespace, deploymentName }),
  }));
  let deploymentRefreshState = $state<
    DeploymentRefreshState<WorkerDeploymentResponse, typeof deploymentRoute>
  >({});
  const refreshDeployment = createLatestDeploymentRefresher(
    (route) =>
      fetchDeployment({
        namespace: route.namespace,
        deploymentName: route.deploymentName,
      }),
    () => deploymentRoute,
    (result) =>
      (deploymentRefreshState = updateDeploymentRefreshState(
        deploymentRefreshState,
        result,
      )),
  );

  function reload() {
    void refreshDeployment();
  }

  let connectionStatusRefreshes = $state<number[]>([]);

  function handleValidationComplete() {
    // An empty validation request validates the persisted/current config. The
    // backend persists connection status asynchronously, so refreshes observe it.
    connectionStatusRefreshes = scheduleConnectionStatusRefreshes(
      reload,
      connectionStatusRefreshes,
    );
  }

  onDestroy(() => connectionStatusRefreshes.forEach(clearTimeout));

  let showDeleteModal = $state(false);
  let deleteError = $state<string | undefined>();

  async function handleDeleteDeployment(conflictToken: string) {
    deleteError = undefined;
    await deleteWorkerDeployment(
      { namespace, deploymentName, conflictToken },
      () => {
        deleteError = translate('deployments.delete-deployment-confirm-error');
      },
    );
    if (!deleteError) {
      goto(routeForWorkerDeployments({ namespace }));
    }
  }

  let showRampUnversionedModal = $state(false);
  let rampUnversionedPercentage = $state(0);
  let rampUnversionedError = $state('');

  async function handleRampUnversioned(percentage: number) {
    rampUnversionedError = '';
    await setRampingUnversionedWorkers(
      { namespace, deploymentName, percentage },
      (err) => {
        rampUnversionedError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.ramp-to-unversioned-error');
      },
    );
    if (rampUnversionedError) return;
    showRampUnversionedModal = false;
    reload();
  }

  async function handleRemoveRampUnversioned(conflictToken?: string) {
    rampUnversionedError = '';
    await removeRampingUnversionedWorkers(
      { namespace, deploymentName, conflictToken },
      (err) => {
        rampUnversionedError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.ramp-to-unversioned-error');
      },
    );
    if (rampUnversionedError) return;
    showRampUnversionedModal = false;
    reload();
  }
</script>

{#key deploymentRoute.key}
  {#await deploymentRoute.initialPromise}
    <SkeletonTable rows={15} />
  {:then initialDeployment}
    {@const currentDeploymentRefresh =
      deploymentRefreshState.deployment &&
      isCurrentDeploymentRoute(
        deploymentRefreshState.deployment.key,
        deploymentRoute,
      )
        ? deploymentRefreshState.deployment
        : undefined}
    {@const currentRefreshError =
      deploymentRefreshState.error &&
      isCurrentDeploymentRoute(
        deploymentRefreshState.error.key,
        deploymentRoute,
      )
        ? deploymentRefreshState.error
        : undefined}
    {@const deployment =
      currentDeploymentRefresh?.deployment ?? initialDeployment}
    {#if currentRefreshError}
      <Error error={currentRefreshError.error} />
    {/if}
    {@const info = deployment.workerDeploymentInfo}
    {@const unversionedRampingPercentage =
      !info.routingConfig?.rampingDeploymentVersion &&
      info.routingConfig?.rampingVersionPercentage != null
        ? info.routingConfig.rampingVersionPercentage
        : null}

    <DeploymentHeader
      {namespace}
      {deploymentName}
      {showInstancesLink}
      onDeleteClick={() => (showDeleteModal = true)}
      onRampToUnversioned={() => {
        rampUnversionedPercentage = unversionedRampingPercentage ?? 0;
        showRampUnversionedModal = true;
      }}
    />

    {#if unversionedRampingPercentage !== null}
      <CapabilityGuard capability="serverScaledDeployments">
        <Alert
          intent="warning"
          title={translate('deployments.unversioned-ramping-banner', {
            percentage: unversionedRampingPercentage,
          })}
          class="mt-4"
        />
      </CapabilityGuard>
    {/if}

    <div class="mt-4">
      <PaginatedTable
        aria-label={translate('deployments.deployments')}
        perPageLabel={translate('common.per-page')}
        nextPageButtonLabel={translate('common.next-page')}
        previousPageButtonLabel={translate('common.previous-page')}
        pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
        items={info.versionSummaries ?? []}
        maxHeight="fit-content"
        let:visibleItems
      >
        <caption class="sr-only" slot="caption">
          {translate('deployments.deployments')}
        </caption>
        <tr slot="headers">
          <th>{translate('deployments.build-id')}</th>
          <th>{translate('deployments.lifecycle')}</th>
          <CapabilityGuard capability="serverScaledDeployments">
            <th>{translate('deployments.compute')}</th>
          </CapabilityGuard>
          <CapabilityGuard capability="serverScaledDeployments">
            <th>{translate('deployments.connection')}</th>
          </CapabilityGuard>
          <th>{translate('deployments.deployed')}</th>
          <th>{translate('deployments.actions')}</th>
        </tr>
        {#each visibleItems as version (version.version)}
          <VersionTableRow
            routingConfig={info.routingConfig}
            {version}
            {namespace}
            {deploymentName}
            conflictToken={deployment.conflictToken}
            onChange={reload}
            onValidationComplete={handleValidationComplete}
          />
        {/each}
      </PaginatedTable>
    </div>

    {#if deleteError}
      <Error error={deleteError} />
    {/if}

    <DeleteDeploymentModal
      open={showDeleteModal}
      {deploymentName}
      hasVersions={!!info.versionSummaries?.length}
      error={deleteError}
      onConfirm={() => handleDeleteDeployment(deployment.conflictToken)}
      onCancel={() => (showDeleteModal = false)}
    />

    <RampUnversionedModal
      open={showRampUnversionedModal}
      bind:percentage={rampUnversionedPercentage}
      error={rampUnversionedError}
      onConfirm={handleRampUnversioned}
      onCancel={() => {
        showRampUnversionedModal = false;
        rampUnversionedError = '';
      }}
      onRemove={unversionedRampingPercentage !== null
        ? () => handleRemoveRampUnversioned(deployment.conflictToken)
        : undefined}
    />
  {:catch error}
    <Error {error} />
  {/await}
{/key}

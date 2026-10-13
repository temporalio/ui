<script lang="ts">
  import { untrack } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeploymentVersion } from '$lib/services/deployments-service';
  import {
    type DescribeWorkerDeployment,
    isVersionSummaryNew,
    type VersionTaskQueue,
    type WorkerDeploymentVersionResponse,
  } from '$lib/types/deployments';
  import type { NamespaceRegion } from '$lib/utilities/compute-regions';
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
  import {
    VERSION_DETAILS_PARAM,
    versionDetailsHref,
  } from '$lib/utilities/version-details';

  import DeploymentStatus from '../deployment-status.svelte';
  import VersionActionsMenu from '../version-actions-menu.svelte';
  import VersionActions from '../version-actions.svelte';

  import VersionLifecycle from './version-lifecycle.svelte';
  import VersionMetadata from './version-metadata.svelte';
  import VersionServerlessWorkers from './version-serverless-workers.svelte';
  import VersionTaskQueues from './version-task-queues.svelte';

  /**
   * One Version's details, opened by `?version=<buildId>` on the Deployment
   * page. The parameter makes the drawer a link: it opens in a new tab, and
   * Back closes it.
   */
  interface Props {
    namespace: string;
    deploymentName: string;
    info: DescribeWorkerDeployment;
    conflictToken?: string;
    namespaceRegions?: readonly NamespaceRegion[];
    onChange?: () => void;
    onValidationComplete?: () => void;
  }

  let {
    namespace,
    deploymentName,
    info,
    conflictToken,
    namespaceRegions,
    onChange,
    onValidationComplete,
  }: Props = $props();

  const buildId = $derived(
    page.url.searchParams.get(VERSION_DETAILS_PARAM) || undefined,
  );

  const summary = $derived(
    buildId
      ? info.versionSummaries?.find(
          (version) =>
            versionRouting(version, info.routingConfig).buildId === buildId,
        )
      : undefined,
  );
  const routing = $derived(
    summary ? versionRouting(summary, info.routingConfig) : undefined,
  );

  // Close with Back when this page opened the drawer, so the history has no
  // extra entry. A visitor who landed on the link has no page to go back to.
  let openedInPage = false;
  let previousBuildId = untrack(() => buildId);
  $effect(() => {
    if (buildId && !previousBuildId) openedInPage = true;
    if (!buildId) openedInPage = false;
    previousBuildId = buildId;
  });

  function close() {
    if (openedInPage) {
      history.back();
      return;
    }
    goto(versionDetailsHref(page.url), {
      replaceState: true,
      keepFocus: true,
      noScroll: true,
    });
  }

  let retryCount = $state(0);

  // Refetch when the Deployment refreshes, because an action in the drawer
  // changes the Version's status and timestamps.
  const detailsPromise = $derived.by(
    (): Promise<WorkerDeploymentVersionResponse> | undefined => {
      void retryCount;
      void info;
      if (!buildId) return undefined;
      return fetchDeploymentVersion({ namespace, deploymentName, buildId });
    },
  );

  // Stats cost the server a read of every task queue, so they load on their
  // own and never hold up the rest of the drawer.
  let stats = $state.raw<readonly VersionTaskQueue[] | undefined | null>();
  $effect(() => {
    void retryCount;
    void info;
    const id = buildId;
    stats = undefined;
    if (!id) return;
    let cancelled = false;
    fetchDeploymentVersion({ namespace, deploymentName, buildId: id }, fetch, {
      reportTaskQueueStats: true,
    })
      .then((response) => {
        if (!cancelled) stats = response.versionTaskQueues ?? [];
      })
      .catch(() => {
        if (!cancelled) stats = null;
      });
    return () => {
      cancelled = true;
    };
  });

  const status = $derived(
    summary ? versionStatus(summary, info.routingConfig) : undefined,
  );

  const hasComputeConfig = $derived(
    summary && isVersionSummaryNew(summary)
      ? Object.keys(summary.computeConfig?.scalingGroups ?? {}).length > 0
      : false,
  );

  const editHref = $derived(
    routeForWorkerDeploymentVersionEdit({
      namespace,
      deployment: deploymentName,
      buildId: buildId ?? '',
    }),
  );

  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeploymentVersion="${summary ? getDeploymentVersionFromStruct(summary) : `${deploymentName}:${buildId}`}"`,
    }) ?? '',
  );

  const canRamp = $derived(
    summary && isVersionSummaryNew(summary)
      ? parseVersionStatus(summary.status).status !== 'Created'
      : true,
  );

  let actions = $state<VersionActions>();
</script>

<Drawer
  open={Boolean(buildId)}
  position="right"
  dark={false}
  onClick={close}
  id="version-details-drawer"
  labelledby="version-details-heading"
  backdrop
  closeButtonLabel={translate('deployments.details-close')}
  closePadding={false}
  class="w-screen sm:w-[560px] sm:max-w-[560px]"
>
  {#if buildId}
    <!-- The header and the action bar stay put; only the details scroll. -->
    <div class="flex h-full flex-col">
      <header class="flex shrink-0 flex-col gap-3 border-b border-primary p-6">
        <div class="flex flex-col gap-1 pr-8">
          <p class="text-xs text-secondary">
            {translate('deployments.details-version')}
          </p>
          <Copyable
            visible
            content={buildId}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          >
            <h2
              id="version-details-heading"
              tabindex="-1"
              data-autofocus
              class="break-all font-mono text-lg font-medium focus:outline-none"
            >
              {buildId}
            </h2>
          </Copyable>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          {#if status}
            <DeploymentStatus
              status={status.status}
              label={status.label}
              appearance="badge"
            />
          {/if}
          <span class="text-sm text-secondary">
            {translate('deployments.details-deployment', { deploymentName })}
          </span>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto">
        {#await detailsPromise}
          <div aria-busy="true" class="flex flex-col gap-3 p-6">
            {#each [1, 2, 3, 4, 5] as row (row)}
              <div class="flex items-center gap-3">
                <div
                  class="h-3 w-24 animate-pulse rounded bg-surface-tertiary"
                ></div>
                <div
                  class="h-3 w-56 animate-pulse rounded bg-surface-tertiary"
                ></div>
              </div>
            {/each}
          </div>
        {:then response}
          {#if response && (summary || response.workerDeploymentVersionInfo.createTime)}
            {@const details = response.workerDeploymentVersionInfo}
            {@const detailStatus =
              status?.status ?? parseVersionStatus(details.status).status}
            <div class="flex flex-col divide-y divide-primary">
              <div class="p-6">
                <VersionLifecycle info={details} status={detailStatus} />
              </div>
              <div class="p-6">
                <VersionServerlessWorkers
                  computeConfig={details.computeConfig}
                  {namespaceRegions}
                  {editHref}
                />
              </div>
              <div class="p-6">
                <VersionTaskQueues
                  {namespace}
                  taskQueues={response.versionTaskQueues ??
                    details.taskQueueInfos ??
                    []}
                  {stats}
                />
              </div>
              {#if Object.keys(details.metadata?.entries ?? {}).length}
                <div class="p-6">
                  <VersionMetadata entries={details.metadata?.entries} />
                </div>
              {/if}
              {#if details.lastModifierIdentity}
                <p class="p-6 text-xs text-secondary">
                  {translate('deployments.details-last-modified-by', {
                    identity: details.lastModifierIdentity,
                  })}
                </p>
              {/if}
            </div>
          {:else}
            <div class="flex flex-col items-start gap-3 p-6">
              <p class="text-sm">
                {translate('deployments.details-not-found', {
                  buildId,
                  deploymentName,
                })}
              </p>
              <Button size="xs" variant="tertiary" onclick={close}>
                {translate('common.close')}
              </Button>
            </div>
          {/if}
        {:catch error}
          <div class="p-6">
            <Alert
              intent="error"
              title={translate('deployments.version-load-error')}
            >
              <div class="flex flex-col items-start gap-2">
                {#if error?.message}<p>{error.message}</p>{/if}
                <Button
                  size="xs"
                  variant="tertiary"
                  onclick={() => retryCount++}
                >
                  {translate('common.retry')}
                </Button>
              </div>
            </Alert>
          </div>
        {/await}
      </div>
      {#if routing}
        <footer
          class="flex shrink-0 flex-wrap items-center gap-2 border-t border-primary px-6 py-4"
        >
          {#if hasComputeConfig}
            <Button size="xs" href={editHref}>
              {translate('deployments.edit')}
            </Button>
          {/if}
          <Button size="xs" variant="tertiary" href={workflowHref}>
            {translate('deployments.view-workflows')}
          </Button>
          <div class="ml-auto">
            <VersionActionsMenu
              inDrawer
              buildId={routing.buildId}
              {editHref}
              {workflowHref}
              isCurrent={routing.isCurrent}
              {hasComputeConfig}
              isRamping={routing.isRamping}
              onSetCurrent={() => actions?.setCurrent()}
              onSetRamping={() => actions?.setRamping()}
              onUnsetCurrent={() => actions?.unsetCurrent()}
              onValidate={() => actions?.validate()}
              onDelete={() => actions?.remove()}
            />
          </div>
        </footer>
      {/if}
    </div>

    {#if routing}
      <VersionActions
        bind:this={actions}
        {namespace}
        {deploymentName}
        buildId={routing.buildId}
        routingConfig={info.routingConfig}
        {conflictToken}
        {canRamp}
        {onChange}
        {onValidationComplete}
        onDeleted={close}
      />
    {/if}
  {/if}
</Drawer>

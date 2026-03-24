<script lang="ts">
  import { page } from '$app/state';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Error from '$lib/holocene/error.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForServerlessWorkerEdit,
    routeForWorkerDeployments,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  const { namespace } = $derived(page.params);
  const deploymentName = $derived(decodeURIForSvelte(page.params.deployment));
  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeployment="${deploymentName}"`,
    }),
  );

  const deploymentFetch = $derived(
    fetchDeployment({ namespace, deploymentName }),
  );

  const columns = [
    { label: translate('deployments.build-id') },
    { label: translate('deployments.status') },
    { label: translate('deployments.deployed') },
    { label: translate('deployments.actions') },
  ];
</script>

{#await deploymentFetch}
  <SkeletonTable rows={15} />
{:then deployment}
  {@const info = deployment.workerDeploymentInfo}
  {@const computeConfig = info.computeConfig}
  {@const isLambda = computeConfig?.provider?.type === 'lambda'}
  {@const providerDetail = isLambda
    ? (JSON.parse(computeConfig?.provider?.detailJson ?? '{}') as {
        lambdaArn?: string;
        iamRoleArn?: string;
        region?: string;
      })
    : null}
  {@const currentBuildId =
    info.routingConfig.currentDeploymentVersion?.buildId ??
    info.currentVersionSummary?.deploymentVersion?.buildId}

  <header class="flex flex-col gap-4">
    <div class="flex items-center gap-2 text-sm">
      <Link href={routeForWorkerDeployments({ namespace })} icon="chevron-left">
        {translate('deployments.back-to-deployments')}
      </Link>
      <span class="text-secondary">|</span>
      <Link href={workflowHref}>
        {translate('workers.go-to-workflows')}
      </Link>
    </div>

    <div class="flex w-full items-center justify-between">
      <h1 class="text-2xl font-semibold">{deploymentName}</h1>
      <CapabilityGuard capability="editServerlessDeployment">
        {#if isLambda}
          <Button
            href={routeForServerlessWorkerEdit({
              namespace,
              id: deploymentName,
            })}
          >
            {translate('workers.edit-serverless-worker-title')}
          </Button>
        {/if}
      </CapabilityGuard>
    </div>

    <div class="flex flex-wrap gap-x-8 gap-y-1 text-sm">
      <div class="flex gap-2">
        <span class="text-secondary">{translate('workers.created-at')}</span>
        <Timestamp dateTime={info.createTime} />
      </div>
      {#if currentBuildId}
        <div class="flex gap-2">
          <span class="text-secondary">{translate('deployments.build-id')}</span
          >
          <span>{currentBuildId}</span>
        </div>
      {/if}
      <CapabilityGuard capability="serverlessDeployments">
        {#if isLambda}
          <div class="flex items-center gap-2">
            <span class="text-secondary"
              >{translate('workers.compute-label')}</span
            >
            <span>Lambda</span>
          </div>
        {/if}
      </CapabilityGuard>
    </div>
  </header>

  <CapabilityGuard capability="serverlessDeployments">
    {#if isLambda}
      <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div class="xl:col-span-2">
          <Card>
            <h3 class="mb-4 text-base font-semibold">
              {translate('workers.compute-provider-section')}
            </h3>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-sm">
                  <span class="w-24 shrink-0 text-secondary">
                    {translate('workers.lambda-arn-label')}
                  </span>
                  <a
                    href="https://console.aws.amazon.com/lambda/home#/functions/{providerDetail?.lambdaArn?.split(
                      ':function:',
                    )?.[1]}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {translate('workers.open-aws-lambda')}
                    <Icon name="external-link" class="h-3 w-3" />
                  </a>
                </div>
                {#if providerDetail?.lambdaArn}
                  <div class="flex items-center gap-2">
                    <code class="text-sm">{providerDetail.lambdaArn}</code>
                    <button
                      type="button"
                      aria-label={translate('workers.copy-arn')}
                      onclick={() =>
                        navigator.clipboard.writeText(
                          providerDetail.lambdaArn ?? '',
                        )}
                    >
                      <Icon
                        name="copy"
                        class="h-4 w-4 text-secondary hover:text-primary"
                      />
                    </button>
                  </div>
                {/if}
              </div>

              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-sm">
                  <span class="w-24 shrink-0 text-secondary">
                    {translate('workers.iam-role-label')}
                  </span>
                  <a
                    href="https://console.aws.amazon.com/iam/home#/roles/{providerDetail?.iamRoleArn?.split(
                      ':role/',
                    )?.[1]}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {translate('workers.open-aws-iam')}
                    <Icon name="external-link" class="h-3 w-3" />
                  </a>
                </div>
                {#if providerDetail?.iamRoleArn}
                  <code class="text-sm">{providerDetail.iamRoleArn}</code>
                {/if}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 class="mb-4 text-base font-semibold">
              {translate('workers.worker-scaling-limits')}
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-secondary">
                  {translate('workers.max-instances-label')}
                </span>
                <span class="text-sm"
                  >{computeConfig?.scaler?.maxInstances ?? '—'}</span
                >
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-secondary">
                  {translate('workers.min-instances-label')}
                </span>
                <span class="text-sm"
                  >{computeConfig?.scaler?.minInstances ?? '—'}</span
                >
              </div>
            </div>
          </Card>
        </div>
      </div>
    {/if}
  </CapabilityGuard>

  <div class="mt-4">
    <PaginatedTable
      aria-label={translate('deployments.deployments')}
      perPageLabel={translate('common.per-page')}
      nextPageButtonLabel={translate('common.next-page')}
      previousPageButtonLabel={translate('common.previous-page')}
      pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
      items={info.versionSummaries}
      let:visibleItems
    >
      <caption class="sr-only" slot="caption">
        {translate('deployments.deployments')}
      </caption>
      <tr slot="headers">
        {#each columns as { label } (label)}
          <th>{label}</th>
        {/each}
      </tr>
      {#each visibleItems as version (version.version)}
        <VersionTableRow
          routingConfig={info.routingConfig}
          {version}
          {columns}
        />
      {/each}
    </PaginatedTable>
  </div>
{:catch error}
  <Error {error} />
{/await}

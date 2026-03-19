<script lang="ts">
  import { goto } from '$app/navigation';

  import DeploymentStatus from '$lib/components/deployments/deployment-status.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import DeleteWorkerModal from '$lib/components/workers/delete-worker-modal.svelte';
  import ServerlessWorkerDetailSkeleton from '$lib/components/workers/serverless-worker-detail-skeleton.svelte';
  import ServerlessWorkerStatus from '$lib/components/workers/serverless-worker-status.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteServerlessWorker,
    getServerlessWorker,
    getServerlessWorkerDetail,
  } from '$lib/services/serverless-worker-service';
  import type { ServerlessWorkerMetricsCard } from '$lib/types/serverless-workers';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import {
    routeForServerlessWorkerEdit,
    routeForWorkers,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  type Props = { id: string; namespace: string; loading?: boolean };
  let { id, namespace, loading = false }: Props = $props();

  const worker = $derived(getServerlessWorker(id));
  const detail = $derived(getServerlessWorkerDetail(id));
  const isSelfManaged = $derived(worker?.compute === 'Self-Managed');

  let showDeleteModal = $state(false);

  const { copy: copyLambda, copied: lambdaCopied } = copyToClipboard();
  const { copy: copyIam, copied: iamCopied } = copyToClipboard();

  function handleDelete() {
    deleteServerlessWorker(id);
    goto(routeForWorkers({ namespace }));
  }

  function parseLambdaArn(arn: string) {
    const parts = arn.split(':');
    return { region: parts[3], functionName: parts[6] };
  }

  function parseIamRoleArn(arn: string) {
    const parts = arn.split('/');
    return { roleName: parts[parts.length - 1] };
  }
</script>

{#if loading}
  <ServerlessWorkerDetailSkeleton />
{:else if !worker}
  <Alert intent="warning" title="Serverless worker not found">
    No serverless worker found with ID "{id}".
  </Alert>
{:else}
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-2 text-sm">
      <Link href={routeForWorkers({ namespace })} icon="chevron-left">
        {translate('workers.back-to-workers')}
      </Link>
      <span class="text-secondary">|</span>
      <Link
        href={routeForWorkflowsWithQuery({
          namespace,
          query: `TaskQueue="${worker.taskQueue}"`,
        })}
      >
        {translate('workers.go-to-workflows')}
      </Link>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <ServerlessWorkerStatus status={worker.status} />
        <h2 class="text-2xl font-semibold">{worker.name}</h2>
      </div>
      {#if !isSelfManaged}
        <div class="flex items-center gap-2">
          <Button href={routeForServerlessWorkerEdit({ namespace, id })}>
            {translate('workers.edit-serverless-worker')}
          </Button>
          <Button
            variant="destructive"
            on:click={() => (showDeleteModal = true)}
          >
            {translate('common.delete')}
          </Button>
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-6 border-b border-subtle pb-4">
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-secondary"
          >{translate('workers.task-queue')}</span
        >
        <span class="text-sm font-medium">{worker.taskQueue}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-secondary"
          >{translate('workers.compute-label')}</span
        >
        <div class="flex items-center gap-1.5">
          <Icon name="robot" />
          <span class="text-sm font-medium">{worker.compute}</span>
        </div>
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-secondary"
          >{translate('workers.last-heartbeat-label')}</span
        >
        <span class="text-sm font-medium"
          ><Timestamp dateTime={worker.lastHeartbeat} /></span
        >
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-secondary"
          >{translate('workers.created-at')}</span
        >
        <span class="text-sm font-medium"
          ><Timestamp dateTime={worker.createdAt} /></span
        >
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-secondary"
          >{translate('workers.sdk-label')}</span
        >
        <span class="text-sm font-medium">{worker.sdkVersion}</span>
      </div>
    </div>

    {#if !isSelfManaged}
      {@const lambdaParsed = parseLambdaArn(worker.lambdaArn)}
      {@const iamParsed = parseIamRoleArn(worker.iamRoleArn)}
      <Card class="flex flex-col gap-5 !p-5">
        <div class="flex flex-col">
          <h3 class="text-base font-medium">
            {translate('workers.deployment-config')}
          </h3>
          <p class="text-sm text-secondary">
            {translate('workers.deployment-config-description')}
          </p>
        </div>

        <div class="flex gap-6">
          <div class="flex flex-1 flex-col gap-2">
            <h4 class="text-sm font-medium">
              {translate('workers.compute-provider-section')}
            </h4>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium">
                  {translate('workers.lambda-arn')}
                </span>
                <Link
                  href={`https://console.aws.amazon.com/lambda/home?region=${lambdaParsed.region}#/functions/${lambdaParsed.functionName}`}
                  newTab
                >
                  {translate('workers.open-aws-lambda')}
                </Link>
              </div>
              <div class="flex items-center gap-1">
                <span class="break-all text-sm">
                  {worker.lambdaArn}
                </span>
                <CopyButton
                  copyIconTitle={translate('workers.copy-arn')}
                  copySuccessIconTitle={translate('workers.copied')}
                  copied={$lambdaCopied}
                  on:click={(e) => copyLambda(e, worker.lambdaArn)}
                />
              </div>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium">
                  {translate('workers.iam-role-arn')}
                </span>
                <Link
                  href={`https://console.aws.amazon.com/iam/home#/roles/${iamParsed.roleName}`}
                  newTab
                >
                  {translate('workers.open-aws-iam')}
                </Link>
              </div>
              <div class="flex items-center gap-1">
                <span class="break-all text-sm">
                  {worker.iamRoleArn}
                </span>
                <CopyButton
                  copyIconTitle={translate('workers.copy-arn')}
                  copySuccessIconTitle={translate('workers.copied')}
                  copied={$iamCopied}
                  on:click={(e) => copyIam(e, worker.iamRoleArn)}
                />
              </div>
            </div>
          </div>

          <div class="w-px self-stretch bg-subtle"></div>

          <div class="flex flex-col gap-2.5">
            <h4 class="text-sm font-medium">
              {translate('workers.worker-scaling-limits')}
            </h4>
            <div class="flex gap-6">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-medium"
                  >{translate('workers.max-workers')}</span
                >
                <span class="font-mono text-sm">{worker.maxWorkers}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-medium"
                  >{translate('workers.max-task-queue-rate')}</span
                >
                <span class="font-mono text-sm"
                  >{worker.maxTaskQueueActivitiesPerSecond}/s</span
                >
              </div>
            </div>
            <div class="flex gap-6">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-medium"
                  >{translate('workers.max-concurrent-activities')}</span
                >
                <span class="font-mono text-sm"
                  >{worker.maxConcurrentActivities}</span
                >
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-medium"
                  >{translate('workers.idle-timeout')}</span
                >
                <span class="font-mono text-sm"
                  >{worker.idleTimeoutSeconds}s</span
                >
              </div>
            </div>
          </div>
        </div>
      </Card>
    {/if}

    <Tabs>
      <TabList label={translate('workers.serverless-worker')}>
        <Tab
          id="metrics-tab"
          panelId="metrics-panel"
          label={translate('workers.metrics')}
        />
        <Tab
          id="versions-tab"
          panelId="versions-panel"
          label={translate('workers.versions')}
        />
      </TabList>
      <TabPanel id="metrics-panel" tabId="metrics-tab">
        {#if detail}
          <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div class="col-span-1 flex flex-col gap-4 xl:col-span-2">
              {#each [{ title: translate('workers.workflow'), data: detail.metrics.workflow }, { title: translate('workers.activity'), data: detail.metrics.activity }, { title: translate('workers.nexus-tasks'), data: detail.metrics.nexus }, { title: translate('workers.local-activities'), data: detail.metrics.localActivities }] as { title, data } (title)}
                {@const card = data as ServerlessWorkerMetricsCard}
                <Card>
                  <div class="flex items-center gap-2 pb-2.5 pt-1">
                    <h4 class="text-base font-medium">{title}</h4>
                    <Badge type="ghost">{card.slotType}</Badge>
                  </div>
                  <div class="flex flex-wrap gap-6 pt-2.5">
                    <div class="flex min-w-0 flex-1 flex-col">
                      <span class="text-sm">{translate('workers.slots')}</span>
                      <div class="flex flex-col gap-2">
                        <div class="flex gap-5">
                          <div class="flex flex-col">
                            <span class="font-mono text-2xl text-brand"
                              >{card.slotsUsed}</span
                            >
                            <span class="text-xs text-secondary"
                              >{translate('workers.used')}</span
                            >
                          </div>
                          <div class="flex flex-col text-secondary">
                            <span class="font-mono text-2xl"
                              >{card.slotsAvailable}</span
                            >
                            <span class="text-xs"
                              >Available out of {card.slotsAvailable}</span
                            >
                          </div>
                        </div>
                        <div class="h-2 w-full rounded-lg bg-subtle">
                          <div
                            class="h-2 rounded-lg bg-blue-500"
                            style="width: {(card.slotsUsed /
                              card.slotsAvailable) *
                              100}%"
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col">
                      <span class="text-sm"
                        >{translate('workers.tasks-processed')}</span
                      >
                      <span class="font-mono text-2xl"
                        >{card.tasksProcessed.toLocaleString()}</span
                      >
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col">
                      <div class="flex items-center gap-2">
                        <span class="text-sm"
                          >{translate('workers.poller')}</span
                        >
                        <Badge type="ghost">{card.pollerStrategy}</Badge>
                      </div>
                      <span class="font-mono text-2xl">{card.pollerCount}</span>
                      <span class="text-xs text-secondary"
                        >{translate('workers.last-poll')}
                        <Timestamp dateTime={card.lastPoll} /></span
                      >
                    </div>
                  </div>
                </Card>
              {/each}
            </div>

            <div class="col-span-1 flex flex-col gap-4">
              <Card class="!p-0">
                <div class="px-5 pb-2.5 pt-5">
                  <h4 class="text-base font-medium">
                    {translate('workers.host-info')}
                  </h4>
                </div>
                <div class="flex flex-col gap-2.5 px-5 pb-5 pt-2.5">
                  <div class="flex flex-col gap-1.5">
                    <span class="text-xs font-medium"
                      >{translate('workers.region')}</span
                    >
                    <div class="flex items-center gap-1.5">
                      <Icon name="regions" />
                      <span class="text-sm">{detail.hostInfo.region}</span>
                    </div>
                  </div>
                  {#each [{ label: translate('workers.host-name'), value: detail.hostInfo.hostName }, { label: translate('workers.process-id'), value: detail.hostInfo.processId }, { label: translate('workers.instance-key'), value: detail.hostInfo.instanceKey }, { label: translate('workers.worker-grouping-key'), value: detail.hostInfo.workerGroupingKey }] as { label, value } (label)}
                    <div class="flex flex-col">
                      <span class="text-xs font-medium">{label}</span>
                      <span class="text-sm">{value}</span>
                    </div>
                  {/each}
                </div>
                <div class="flex flex-col gap-2.5 border-t border-subtle p-5">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <Icon name="hyphen" />
                        <span class="text-sm font-medium"
                          >{translate('workers.cpu-usage')}</span
                        >
                      </div>
                      <span class="font-mono text-sm"
                        >{detail.hostInfo.cpuUsage}%</span
                      >
                    </div>
                    <div class="h-2 w-full rounded-lg bg-subtle">
                      <div
                        class="h-2 rounded-lg bg-green-500"
                        style="width: {detail.hostInfo.cpuUsage}%"
                      ></div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <Icon name="server" />
                        <span class="text-sm font-medium"
                          >{translate('workers.memory-usage')}</span
                        >
                      </div>
                      <span class="font-mono text-sm"
                        >{detail.hostInfo.memoryUsage}%</span
                      >
                    </div>
                    <div class="h-2 w-full rounded-lg bg-subtle">
                      <div
                        class="h-2 rounded-lg bg-blue-500"
                        style="width: {detail.hostInfo.memoryUsage}%"
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card class="!p-0">
                <div class="px-5 pb-2.5 pt-5">
                  <h4 class="text-base font-medium">
                    {translate('workers.workflow-cache')}
                  </h4>
                </div>
                <div class="grid grid-cols-2 gap-2.5 px-5 pb-5 pt-2.5">
                  <div class="flex flex-col">
                    <span class="font-mono text-2xl"
                      >{detail.cache.cacheSize.toLocaleString()}</span
                    >
                    <span class="text-sm text-secondary"
                      >{translate('workers.cache-size')}</span
                    >
                  </div>
                  <div class="flex flex-col">
                    <span class="font-mono text-2xl text-green-500"
                      >{detail.cache.cacheHitsPercent}%</span
                    >
                    <span class="text-sm text-secondary"
                      >{translate('workers.cache-hits')}</span
                    >
                  </div>
                  <div class="flex flex-col">
                    <span class="font-mono text-2xl"
                      >{detail.cache.activeThreadCount}</span
                    >
                    <span class="text-sm text-secondary"
                      >{translate('workers.active-threads')}</span
                    >
                  </div>
                </div>
              </Card>

              <Card class="!p-0">
                <div class="px-5 pb-2.5 pt-5">
                  <h4 class="text-base font-medium">
                    {translate('workers.diagnostics')}
                  </h4>
                </div>
                <div class="grid grid-cols-2 gap-2.5 px-5 pb-5 pt-2.5">
                  <div class="flex flex-col">
                    <span class="font-mono text-2xl"
                      >{detail.diagnostics.pollSuccessRatePercent}%</span
                    >
                    <span class="text-sm text-secondary"
                      >{translate('workers.poll-success-rate')}</span
                    >
                  </div>
                  <div class="flex flex-col">
                    <span class="font-mono text-2xl"
                      >{detail.diagnostics.rateLimit
                        ? `${detail.diagnostics.rateLimit}/s`
                        : 'None'}</span
                    >
                    <span class="text-sm text-secondary"
                      >{translate('workers.rate-limit')}</span
                    >
                  </div>
                </div>
              </Card>
            </div>
          </div>
        {/if}
      </TabPanel>
      <TabPanel id="versions-panel" tabId="versions-tab">
        {#if detail}
          <div class="mt-4">
            <Table class="w-full" bordered>
              <svelte:fragment slot="headers">
                <tr>
                  <th>{translate('workers.status')}</th>
                  <th>{translate('workers.version-name')}</th>
                  <th>{translate('workers.buildId')}</th>
                  <th>{translate('workers.deployed-at')}</th>
                  <th>{translate('deployments.actions')}</th>
                </tr>
              </svelte:fragment>
              {#each detail.versions as version (version.name)}
                <TableRow>
                  <td>
                    <DeploymentStatus
                      status={version.status}
                      label={version.status === 'Ramping'
                        ? `Ramping ${version.rampingPercentage ?? 0}%`
                        : version.status}
                    />
                  </td>
                  <td class="text-sm">{version.name}</td>
                  <td class="font-mono text-sm">{version.buildId}</td>
                  <td class="text-sm">
                    <Timestamp dateTime={version.deployedAt} />
                  </td>
                  <td>
                    <Link
                      class="inline-flex items-center gap-1"
                      href={routeForWorkflowsWithQuery({
                        namespace,
                        query: `TaskQueue="${worker.taskQueue}"`,
                      })}
                    >
                      {translate('workers.go-to-workflows')}
                      <Icon name="external-link" />
                    </Link>
                  </td>
                </TableRow>
              {/each}
            </Table>
          </div>
        {/if}
      </TabPanel>
    </Tabs>
  </div>

  <DeleteWorkerModal
    open={showDeleteModal}
    workerName={worker.name}
    on:confirmModal={handleDelete}
    on:cancelModal={() => (showDeleteModal = false)}
  />
{/if}

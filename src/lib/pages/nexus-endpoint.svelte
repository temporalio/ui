<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getPollers } from '$lib/services/pollers-service';
  import type { NexusEndpoint as Endpoint } from '$lib/types/nexus';
  import { pluralize } from '$lib/utilities/pluralize';
  import {
    routeForNamespace,
    routeForNexus,
    routeForNexusEndpointEdit,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  let {
    endpoint,
    editDisabled = false,
  }: { endpoint: Endpoint; editDisabled?: boolean } = $props();

  let pollerCount: number | undefined = $state(undefined);

  const checkTaskQueue = async (endpoint: Endpoint) => {
    const targetNamespace = endpoint?.spec?.target?.worker?.namespace;
    const targetTaskQueue = endpoint?.spec?.target?.worker?.taskQueue;
    if (targetNamespace && targetTaskQueue) {
      try {
        const { pollers } = await getPollers({
          namespace: targetNamespace,
          queue: targetTaskQueue,
        });
        pollerCount = pollers.length;
      } catch (error) {
        pollerCount = undefined;
      }
    }
  };

  $effect(() => {
    checkTaskQueue(endpoint);
  });
</script>

<div class="flex flex-col gap-8">
  <div class="relative flex flex-col gap-4 text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h1 data-testid="namespace-selector-title">
        {endpoint.spec.name}
      </h1>
      <Button
        href={routeForNexusEndpointEdit(endpoint.id)}
        disabled={editDisabled}>{translate('common.edit')}</Button
      >
    </div>
    <p>UUID: {endpoint.id}</p>
  </div>
  <div class="surface-primary max-w-fit border border-secondary p-4">
    <p class="text-lg">Target</p>
    <div class="flex flex-col gap-4 lg:flex-row">
      <div class="flex items-center gap-2">
        <span class="font-medium">Namespace</span>
        <Link
          href={routeForNamespace({
            namespace: endpoint.spec.target.worker.namespace,
          })}
        >
          <i>{endpoint.spec.target.worker.namespace}</i>
        </Link>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-medium">Task Queue</span>
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={endpoint.spec.target.worker.taskQueue}
        >
          <Link
            href={routeForTaskQueue({
              namespace: endpoint.spec.target.worker.namespace,
              queue: endpoint.spec.target.worker.taskQueue,
            })}
          >
            <i>{endpoint.spec.target.worker.taskQueue}</i>
          </Link>
        </Copyable>
      </div>
      {#if pollerCount !== undefined}
        <Alert
          intent={pollerCount > 0 ? 'success' : 'warning'}
          title={pollerCount
            ? 'Task Queue is Active'
            : 'Task Queue is Inactive'}
        >
          <div class="flex w-full items-center justify-between">
            <p>
              {pollerCount}
              {pluralize('Worker', pollerCount)}
            </p>
          </div></Alert
        >
      {/if}
    </div>
  </div>
  <div class="w-full xl:w-1/2">
    <h2>Description</h2>
    <Markdown
      content={endpoint.spec?.descriptionString || 'No description provided'}
    />
  </div>
  {#if endpoint.spec?.allowedCallerNamespaces}
    <h2>Allowed Caller Namespaces</h2>
    <div class="flex flex-wrap items-center gap-4">
      {#each endpoint.spec?.allowedCallerNamespaces as namespace}
        <Link href={routeForNamespace({ namespace })}>{namespace}</Link>
      {/each}
    </div>
  {/if}
</div>

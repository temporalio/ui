<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import NexusOperationHeader from '$lib/components/standalone-nexus-operations/nexus-operation-header.svelte';
  import ErrorComponent from '$lib/holocene/error.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { nexusOperationsSearchParams } from '$lib/stores/nexus-operations';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForStandaloneNexusOperationDetails,
    routeForStandaloneNexusOperationMetadata,
    routeForStandaloneNexusOperations,
    routeForStandaloneNexusOperationSearchAttributes,
  } from '$lib/utilities/route-for';
  import {
    nexusOperationExecution,
    StandaloneNexusOperationPoller,
  } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

  import NexusOperationDetailsLoading from '../components/standalone-nexus-operations/nexus-operation-details-loading.svelte';
  import NexusOperationLayoutLoading from '../components/standalone-nexus-operations/nexus-operation-header-loading.svelte';

  interface Props {
    namespace: string;
    operationId: string;
    runId: string;
    children: Snippet;
  }

  let { children, namespace, operationId, runId }: Props = $props();

  let error = $state<Error | undefined>();
  let loading = $state(true);

  const nexusOperationPollerAbortController = new AbortController();
  const poller = $derived(
    new StandaloneNexusOperationPoller(
      namespace,
      operationId,
      runId,
      nexusOperationPollerAbortController,
      (execution) => {
        $nexusOperationExecution = execution;
        loading = false;
      },
      (e) => {
        error = e;
        loading = false;
      },
    ),
  );

  const routeParameters = $derived({ namespace, operationId, runId });

  const detailsRoute = $derived(
    routeForStandaloneNexusOperationDetails(routeParameters),
  );

  const searchAttributesRoute = $derived(
    routeForStandaloneNexusOperationSearchAttributes(routeParameters),
  );

  const metadataRoute = $derived(
    routeForStandaloneNexusOperationMetadata(routeParameters),
  );

  const nexusOperationsHref = $derived(
    `${routeForStandaloneNexusOperations({ namespace })}?${$nexusOperationsSearchParams}`,
  );

  onMount(async () => {
    poller.start();
  });

  onDestroy(() => {
    poller.abort();
    $nexusOperationExecution = undefined;
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-2">
    <Link
      href={nexusOperationsHref}
      data-testid="back-to-nexus-operations"
      icon="chevron-left"
    >
      {translate('standalone-nexus-operations.back-to-nexus-operations')}
    </Link>
  </div>

  {#if $nexusOperationExecution}
    <NexusOperationHeader
      {namespace}
      {poller}
      nexusOperationInfo={$nexusOperationExecution.info}
    />
  {:else if loading}
    <NexusOperationLayoutLoading />
  {/if}

  <Tabs>
    <TabList label={translate('standalone-nexus-operations.layout-tabs-label')}>
      <Tab
        label={translate('standalone-nexus-operations.layout-details-tab')}
        id="nexus-operation-details-tab"
        href={detailsRoute}
        active={pathMatches(page.url.pathname, detailsRoute)}
      />
      <Tab
        label={translate(
          'standalone-nexus-operations.layout-search-attributes-tab',
        )}
        id="nexus-operation-search-attributes-tab"
        href={searchAttributesRoute}
        active={pathMatches(page.url.pathname, searchAttributesRoute)}
      />
      <Tab
        label={translate(
          'standalone-nexus-operations.layout-user-metadata-tab',
        )}
        id="nexus-operation-metadata-tab"
        href={metadataRoute}
        active={pathMatches(page.url.pathname, metadataRoute)}
      />
    </TabList>
  </Tabs>

  {#if $nexusOperationExecution}
    {@render children()}
  {:else if loading}
    <NexusOperationDetailsLoading />
  {:else if error}
    <ErrorComponent {error} />
  {/if}
</div>

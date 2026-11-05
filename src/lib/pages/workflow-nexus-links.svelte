<script lang="ts">
  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import SdkGettingStartedLinks from '$lib/components/sdk-getting-started-links.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import TabButtonList from '$lib/holocene/tabs-primitive/tab-button-list.svelte';
  import TabPanels from '$lib/holocene/tabs-primitive/tab-panels.svelte';
  import Tabs from '$lib/holocene/tabs-primitive/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import Segment from '$lib/io/segmented-control/segment.svelte';
  import SegmentedControl from '$lib/io/segmented-control/segmented-control.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import {
    getInboundLinkForEvent,
    getVisibleInboundNexusLinkEvents,
  } from '$lib/runes/inbound-nexus-links.svelte';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { isSystemNexusScheduledEvent } from '$lib/system-nexus-endpoints';
  import {
    type EventLinkDisplay,
    eventLinkTargetTypeLabel,
    toEventLinkView,
  } from '$lib/utilities/event-link';
  import { toInboundLinkRow } from '$lib/utilities/inbound-link-row';
  import { isNexusOperationScheduledEvent } from '$lib/utilities/is-event-type';
  import {
    getNexusLinksView,
    type NexusLinksView,
    nexusLinksViewKey,
    nexusLinksViews,
  } from '$lib/utilities/nexus-links-view';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const { namespace, workflow: workflowId, run } = $derived(page.params);
  const { workflow } = $derived($workflowRun);
  const pendingActivities = $derived(workflow?.pendingActivities);
  const pendingNexusOperations = $derived(workflow?.pendingNexusOperations);

  const groups = $derived(
    groupEvents(
      $fullEventHistory,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );
  const nexusGroups = $derived(
    groups.filter(
      (group) =>
        group.category === 'nexus' &&
        group.links?.length &&
        !group.eventList.some((event) => isSystemNexusScheduledEvent(event)),
    ),
  );
  const inboundLinks = getVisibleInboundNexusLinkEvents(
    () => $fullEventHistory,
  );
  const inboundLinkEvents = $derived(inboundLinks.events);

  const counts = $derived({
    inbound: inboundLinkEvents?.length ?? 0,
    outbound: nexusGroups.length,
  });
  const selectedView = $derived(
    getNexusLinksView(page.url.searchParams.get(nexusLinksViewKey), counts),
  );

  const viewLabels: Record<NexusLinksView, string> = {
    inbound: translate('nexus.inbound-links'),
    outbound: translate('nexus.outbound-links'),
  };

  const handleViewChange = (view: NexusLinksView) => {
    updateQueryParameters({
      parameter: nexusLinksViewKey,
      value: view,
      url: page.url,
    });
  };
</script>

{#snippet linkDisplay(view: Pick<EventLinkDisplay, 'value' | 'href'>)}
  {#if view.href}
    <Link href={view.href}>{view.value}</Link>
  {:else}
    {view.value}
  {/if}
{/snippet}

{#snippet linksEmptyState(testId: string, message: string)}
  <div
    class="flex flex-col items-center gap-2 p-8 text-center"
    data-testid={testId}
  >
    <NoQueryResults class="mb-4" />
    <h3 class="text-primary">{message}</h3>
    <SdkGettingStartedLinks />
  </div>
{/snippet}

{#snippet inboundTable()}
  <PaginatedTable
    id="inbound-nexus-links"
    class="mb-6 w-full min-w-[600px]"
    fixed
    aria-label={translate('nexus.inbound-links')}
    perPageLabel={translate('common.per-page')}
    nextPageButtonLabel={translate('common.next-page')}
    previousPageButtonLabel={translate('common.previous-page')}
    pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
    pageParameter="inbound-page"
    perPageParameter="inbound-per-page"
    items={inboundLinkEvents}
  >
    {#snippet caption()}
      <caption class="sr-only">{translate('nexus.inbound-links')}</caption>
    {/snippet}
    {#snippet headers()}
      <TableHeaderRow>
        <th>{translate('nexus.caller-event')}</th>
        <th>{translate('nexus.caller-execution')}</th>
        <th>{translate('nexus.caller-namespace')}</th>
        <th>{translate('nexus.target')}</th>
      </TableHeaderRow>
    {/snippet}
    {#snippet rows({ visibleItems })}
      {#each visibleItems as event (event?.id)}
        {@const row = toInboundLinkRow(
          (event && getInboundLinkForEvent(event)) || undefined,
          namespace,
        )}
        <TableRow data-testid="inbound-link-row">
          <td class="break-all text-left" data-testid="caller-event">
            {#if row.callerEvent}
              {@render linkDisplay(row.callerEvent)}
            {/if}
          </td>
          <td class="break-all text-left" data-testid="caller-execution">
            {#if row.callerExecution}
              {@render linkDisplay(row.callerExecution)}
              {#if row.callerExecution.typeLabel}
                <p class="text-xs text-secondary opacity-80">
                  {row.callerExecution.typeLabel}
                </p>
              {/if}
            {/if}
          </td>
          <td class="break-all text-left" data-testid="caller-namespace">
            {#if row.callerNamespace}
              {@render linkDisplay(row.callerNamespace)}
            {/if}
          </td>
          <td class="break-all text-left" data-testid="target-event">
            <Link
              href={routeForEventHistoryEvent({
                namespace: namespace,
                workflow: workflowId,
                run,
                eventId: event?.id,
              })}
              >{event?.name}
              ({event?.id})
            </Link>
          </td>
        </TableRow>
      {/each}
    {/snippet}
    {#snippet empty()}
      {@render linksEmptyState(
        'inbound-links-empty-state',
        translate('nexus.inbound-links-empty-state'),
      )}
    {/snippet}
  </PaginatedTable>
{/snippet}

{#snippet outboundTable()}
  <PaginatedTable
    id="outbound-nexus-links"
    class="mb-6 w-full min-w-[600px]"
    fixed
    aria-label={translate('nexus.outbound-links')}
    perPageLabel={translate('common.per-page')}
    nextPageButtonLabel={translate('common.next-page')}
    previousPageButtonLabel={translate('common.previous-page')}
    pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
    pageParameter="outbound-page"
    perPageParameter="outbound-per-page"
    items={nexusGroups}
  >
    {#snippet caption()}
      <caption class="sr-only">{translate('nexus.outbound-links')}</caption>
    {/snippet}
    {#snippet headers()}
      <TableHeaderRow>
        <th>{translate('nexus.source-event')}</th>
        <th>{translate('nexus.nexus-endpoint-simple')}</th>
        <th>{translate('nexus.nexus-service')}</th>
        <th>{translate('nexus.nexus-operation')}</th>
        <th>{translate('nexus.handler-namespace')}</th>
        <th>{translate('nexus.handler-target')}</th>
        <th>{translate('nexus.handler-event')}</th>
      </TableHeaderRow>
    {/snippet}
    {#snippet rows({ visibleItems })}
      {#each visibleItems as group (group.id)}
        {@const link = group.links?.[0]}
        {@const linkView = toEventLinkView(link, { namespace })}
        {@const targetTypeLabel = eventLinkTargetTypeLabel(linkView.variant)}
        {@const scheduledEvent = group.eventList.find((e) =>
          isNexusOperationScheduledEvent(e),
        )}
        <TableRow data-testid="worker-row">
          <td class="break-all text-left" data-testid="link-event">
            <Link
              href={routeForEventHistoryEvent({
                namespace,
                workflow: workflowId,
                run,
                eventId: scheduledEvent?.id,
              })}>{scheduledEvent?.id}</Link
            >
          </td>
          <td class="break-all text-left" data-testid="link-endpoint">
            {scheduledEvent?.nexusOperationScheduledEventAttributes?.endpoint}
          </td>
          <td class="break-all text-left" data-testid="link-service">
            {scheduledEvent?.nexusOperationScheduledEventAttributes?.service}
          </td>
          <td class="break-all text-left" data-testid="link-operation">
            {scheduledEvent?.nexusOperationScheduledEventAttributes?.operation}
          </td>
          <td class="break-all text-left" data-testid="link-namespace">
            {#if linkView.namespace}
              {@render linkDisplay(linkView.namespace)}
            {/if}
          </td>
          <td class="break-all text-left" data-testid="link-href">
            {@render linkDisplay(linkView)}
            {#if targetTypeLabel}
              <p
                class="text-xs text-secondary opacity-80"
                data-testid="link-target-type"
              >
                {targetTypeLabel}
              </p>
            {/if}
          </td>
          <td class="break-all text-left" data-testid="link-href">
            {#if linkView.event}
              {@render linkDisplay(linkView.event)}
            {/if}
          </td>
        </TableRow>
      {/each}
    {/snippet}
    {#snippet empty()}
      {@render linksEmptyState(
        'outbound-links-empty-state',
        translate('nexus.outbound-links-empty-state'),
      )}
    {/snippet}
  </PaginatedTable>
{/snippet}

<section class="flex flex-col gap-4">
  <h2 data-testid="nexus-links-title">
    {translate('workflows.nexus-links-tab')}
  </h2>
  {#if !counts.inbound && !counts.outbound}
    <p>
      {translate('nexus.links-empty-state')}
    </p>
  {:else}
    <Tabs
      tabs={[...nexusLinksViews]}
      selectedTab={selectedView}
      onSelectedTabChange={handleViewChange}
    >
      <SegmentedControl class="mr-auto">
        <TabButtonList
          aria-label={translate('workflows.nexus-links-tab')}
          class="contents"
        >
          {#snippet tabButtonSnippet(getTabButtonProps, { isSelected, tab })}
            {@const view = tab as NexusLinksView}
            <Segment
              {...getTabButtonProps()}
              selected={isSelected}
              count={counts[view]}
              data-testid={`nexus-links-${view}-segment`}
            >
              {viewLabels[view]}
            </Segment>
          {/snippet}
        </TabButtonList>
      </SegmentedControl>
      <TabPanels>
        {#snippet tabPanelSnippet(getTabPanelProps, { isSelected, tab })}
          <div {...getTabPanelProps()}>
            {#if isSelected}
              {#if tab === 'inbound'}
                {@render inboundTable()}
              {:else}
                {@render outboundTable()}
              {/if}
            {/if}
          </div>
        {/snippet}
      </TabPanels>
    </Tabs>
  {/if}
</section>

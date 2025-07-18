<script lang="ts">
  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';
  import { isNexusOperationScheduledEvent } from '$lib/utilities/is-event-type';
  import {
    routeForEventHistory,
    routeForEventHistoryEvent,
    routeForNamespace,
  } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

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
    groups.filter((group) => group.category === 'nexus' && group.links?.length),
  );
  const callbacks = $derived(
    workflow?.callbacks?.filter(
      (callback) => callback?.callback?.links?.length,
    ),
  );

  // const requestIds = $derived(
  //   workflow?.workflowExtendedInfo?.requestIdInfos
  //     ? Object.values(workflow?.workflowExtendedInfo?.requestIdInfos)
  //     : [],
  // );
  // const getLinkFromRequestId = $derived((requestId) => {
  //   const event = $fullEventHistory.find(
  //     (event) => event.id === requestId.eventId,
  //   );
  //   if (event?.links?.length) {
  //     return event.links[0];
  //   }
  // });
</script>

<section class="flex flex-col gap-4">
  <h2 data-testid="nexus-links-title">
    {translate('workflows.nexus-links-tab')}
  </h2>
  {#if callbacks?.length}
    <h3>Inbound</h3>
    <Table class="mb-6 w-full min-w-[600px] table-fixed">
      <caption class="sr-only" slot="caption"
        >{translate('workflows.workers-tab')}</caption
      >
      <TableHeaderRow slot="headers">
        <th>{translate('nexus.caller-event')}</th>
        <th>{translate('nexus.caller-workflow')}</th>
        <th>{translate('nexus.caller-namespace')}</th>
        <th>{translate('nexus.handler-event')}</th>
      </TableHeaderRow>
      {#each callbacks as callback}
        {@const link = callback?.callback?.links?.[0]}
        <TableRow data-testid="worker-row">
          <td class="break-all text-left" data-testid="caller-event">
            {#if link?.workflowEvent}
              <Link href={getEventLinkHref(link)}
                >{fromScreamingEnum(
                  link.workflowEvent?.eventRef?.eventType ||
                    link.workflowEvent?.requestIdRef?.eventType,
                  'EventType',
                )}
                {#if link.workflowEvent?.eventRef?.eventId}
                  ({link.workflowEvent.eventRef.eventId})
                {/if}
              </Link>
            {/if}
          </td>
          <td class="break-all text-left" data-testid="link-event">
            {#if link?.workflowEvent}
              <Link
                href={routeForEventHistory({
                  namespace: link.workflowEvent.namespace,
                  workflow: link.workflowEvent.workflowId,
                  run: link.workflowEvent.runId,
                })}>{link.workflowEvent.workflowId}</Link
              >
            {/if}
          </td>
          <td class="break-all text-left" data-testid="link-namespace">
            {#if link?.workflowEvent}
              <Link
                href={routeForNamespace({
                  namespace: link.workflowEvent.namespace,
                })}>{link.workflowEvent.namespace}</Link
              >
            {/if}
          </td>
          <td class="break-all text-left" data-testid="handler-event">
            How do I associate callback to handler event? No requestId on
            callback
          </td>
        </TableRow>
      {/each}
    </Table>
  {/if}
  {#if nexusGroups.length}
    <h3>Outbound</h3>
    <Table class="mb-6 w-full min-w-[600px] table-fixed">
      <caption class="sr-only" slot="caption"
        >{translate('workflows.workers-tab')}</caption
      >
      <TableHeaderRow slot="headers">
        <th>{translate('nexus.source-event')}</th>
        <th>{translate('nexus.nexus-endpoint-simple')}</th>
        <th>{translate('nexus.nexus-service')}</th>
        <th>{translate('nexus.nexus-operation')}</th>
        <th>{translate('nexus.handler-namespace')}</th>
        <th>{translate('nexus.handler-workflow')}</th>
        <th>{translate('nexus.handler-event')}</th>
      </TableHeaderRow>
      {#each nexusGroups as group}
        {@const link = group.links?.[0]}
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
                eventId: scheduledEvent.id,
              })}>{scheduledEvent.id}</Link
            >
          </td>
          <td class="break-all text-left" data-testid="link-endpoint">
            {scheduledEvent?.attributes?.endpoint}
          </td>
          <td class="break-all text-left" data-testid="link-service">
            {scheduledEvent?.attributes?.service}
          </td>
          <td class="break-all text-left" data-testid="link-operation">
            {scheduledEvent?.attributes?.operation}
          </td>
          <td class="break-all text-left" data-testid="link-namespace">
            {#if link?.workflowEvent}
              <Link
                href={routeForNamespace({
                  namespace: link?.workflowEvent?.namespace,
                })}>{link?.workflowEvent?.namespace}</Link
              >
            {/if}
          </td>
          <td class="break-all text-left" data-testid="link-href">
            {#if link?.workflowEvent}
              <Link
                href={routeForEventHistory({
                  namespace: link.workflowEvent.namespace,
                  workflow: link.workflowEvent.workflowId,
                  run: link.workflowEvent.runId,
                })}>{link.workflowEvent.workflowId}</Link
              >
            {/if}
          </td>
          <td class="break-all text-left" data-testid="link-href">
            {#if link?.workflowEvent}
              <Link href={getEventLinkHref(link)}
                >{fromScreamingEnum(
                  link.workflowEvent?.eventRef?.eventType ||
                    link.workflowEvent?.requestIdRef?.eventType,
                  'EventType',
                )}
                {#if link.workflowEvent?.eventRef?.eventId}
                  ({link.workflowEvent.eventRef.eventId})
                {/if}
              </Link>
            {/if}
          </td>
        </TableRow>
      {/each}
    </Table>
  {/if}
</section>

<script lang="ts">
  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import {
    getInboundLinkForEvent,
    getInboundNexusLinkEvents,
  } from '$lib/runes/inbound-nexus-links.svelte';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';
  import { isNexusOperationScheduledEvent } from '$lib/utilities/is-event-type';
  import {
    routeForEventHistoryEvent,
    routeForNamespace,
    routeForTimeline,
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
  const inboundLinkEvents = $derived(
    getInboundNexusLinkEvents($fullEventHistory),
  );
</script>

<section class="flex flex-col gap-4">
  <h2 data-testid="nexus-links-title">
    {translate('workflows.nexus-links-tab')}
  </h2>
  {#if !inboundLinkEvents?.length && !nexusGroups.length}
    <p>
      {translate('nexus.links-empty-state')}
    </p>
  {/if}
  {#if inboundLinkEvents?.length}
    <h3>Inbound</h3>
    <Table class="mb-6 w-full min-w-[600px]" fixed>
      <caption class="sr-only" slot="caption"
        >{translate('workflows.workers-tab')}</caption
      >
      <TableHeaderRow slot="headers">
        <th class="w-24">{translate('nexus.caller-event')}</th>
        <th>{translate('nexus.caller-workflow')}</th>
        <th>{translate('nexus.caller-namespace')}</th>
        <th>{translate('nexus.handler-event')}</th>
      </TableHeaderRow>
      {#each inboundLinkEvents as event}
        {@const link = getInboundLinkForEvent(event)}
        <TableRow data-testid="worker-row">
          <td class="break-all text-left" data-testid="caller-event">
            {#if link?.workflowEvent}
              <Link href={getEventLinkHref(link)}>
                {link.workflowEvent?.eventRef?.eventId}
              </Link>
            {/if}
          </td>
          <td class="break-all text-left" data-testid="link-event">
            {#if link?.workflowEvent}
              <Link
                href={routeForTimeline({
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
            <Link
              href={routeForEventHistoryEvent({
                namespace: namespace,
                workflow: workflowId,
                run,
                eventId: event.id,
              })}
              >{event.name}
              ({event.id})
            </Link>
          </td>
        </TableRow>
      {/each}
    </Table>
  {/if}
  {#if nexusGroups.length}
    <h3>Outbound</h3>
    <Table class="mb-6 w-full min-w-[600px]" fixed>
      <caption class="sr-only" slot="caption"
        >{translate('workflows.workers-tab')}</caption
      >
      <TableHeaderRow slot="headers">
        <th class="w-28">{translate('nexus.source-event')}</th>
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
            {scheduledEvent?.nexusOperationScheduledEventAttributes?.endpoint}
          </td>
          <td class="break-all text-left" data-testid="link-service">
            {scheduledEvent?.nexusOperationScheduledEventAttributes?.service}
          </td>
          <td class="break-all text-left" data-testid="link-operation">
            {scheduledEvent?.nexusOperationScheduledEventAttributes?.operation}
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
                href={routeForTimeline({
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

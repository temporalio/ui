<script lang="ts">
  import {
    DetailList,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
  } from '$lib/components/detail-list';
  import NexusOperationInputAndOutcome from '$lib/components/standalone-nexus-operations/nexus-operation-input-and-outcome.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { toNexusOperationStatus } from '$lib/utilities/get-nexus-operation-status-and-count';
  import {
    routeForNamespace,
    routeForStandaloneNexusOperationsWithQuery,
    routeForWorkflow,
  } from '$lib/utilities/route-for';
  import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';
  import { fromSeconds } from '$lib/utilities/to-duration';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const info = $derived($nexusOperationExecution?.info);

  const hasLastAttemptFailure = $derived(!!info?.lastAttemptFailure);
  const hasNexusHeader = $derived(
    Object.keys(info?.nexusHeader ?? {}).length > 0,
  );

  const handlerWorkflowEvent = $derived(
    info?.links?.find((l) => l.workflowEvent)?.workflowEvent ?? null,
  );
  const handlerNamespace = $derived(handlerWorkflowEvent?.namespace ?? null);
  const handlerWorkflowLink = $derived(
    handlerWorkflowEvent?.namespace && handlerWorkflowEvent?.workflowId
      ? routeForWorkflow({
          namespace: handlerWorkflowEvent.namespace,
          workflow: handlerWorkflowEvent.workflowId,
          run: handlerWorkflowEvent.runId ?? '',
        })
      : null,
  );
  const handlerNamespaceLink = $derived(
    handlerNamespace
      ? routeForNamespace({ namespace: handlerNamespace })
      : null,
  );

  const endpointFilterLink = $derived(
    info
      ? routeForStandaloneNexusOperationsWithQuery(
          { namespace },
          `Endpoint="${info.endpoint}"`,
        )
      : null,
  );
  const serviceFilterLink = $derived(
    info
      ? routeForStandaloneNexusOperationsWithQuery(
          { namespace },
          `Service="${info.service}"`,
        )
      : null,
  );
  const operationFilterLink = $derived(
    info
      ? routeForStandaloneNexusOperationsWithQuery(
          { namespace },
          `Operation="${info.operation}"`,
        )
      : null,
  );
</script>

{#if $nexusOperationExecution && info}
  <NexusOperationInputAndOutcome
    input={$nexusOperationExecution.input}
    outcome={$nexusOperationExecution.outcome}
  />
  <Card class="space-y-6">
    <h5>{translate('standalone-nexus-operations.operation-event-history')}</h5>

    <div class="space-y-4">
      <h6 class="text-secondary">
        {translate('standalone-nexus-operations.run-details-section')}
      </h6>
      <DetailList
        rowCount={7}
        aria-label={translate(
          'standalone-nexus-operations.run-details-section',
        )}
      >
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.schedule-time',
          )}</DetailListLabel
        >
        <DetailListTimestampValue timestamp={info.scheduleTime} />
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.expiration-time',
          )}</DetailListLabel
        >
        <DetailListTimestampValue
          timestamp={info.expirationTime}
          fallback="-"
        />
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.close-time',
          )}</DetailListLabel
        >
        <DetailListTimestampValue timestamp={info.closeTime} fallback="-" />
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.execution-duration',
          )}</DetailListLabel
        >
        <DetailListTextValue
          text={info.executionDuration
            ? fromSeconds(info.executionDuration)
            : '-'}
        />
        <DetailListLabel
          >{translate('standalone-nexus-operations.run-id')}</DetailListLabel
        >
        <DetailListTextValue copyable text={info.runId} />
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.request-id',
          )}</DetailListLabel
        >
        <DetailListTextValue text={info.requestId} />
        {#if info.operationToken}
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.operation-token',
            )}</DetailListLabel
          >
          <DetailListTextValue copyable text={info.operationToken} />
        {/if}
      </DetailList>
    </div>

    <div class="space-y-4">
      <h6 class="text-secondary">
        {translate('standalone-nexus-operations.operation-details-section')}
      </h6>
      <DetailList
        rowCount={6}
        aria-label={translate(
          'standalone-nexus-operations.operation-details-section',
        )}
      >
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.operation-id',
          )}</DetailListLabel
        >
        <DetailListTextValue copyable text={info.operationId} />
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.endpoint-name',
          )}</DetailListLabel
        >
        {#if endpointFilterLink}
          <DetailListLinkValue
            copyable
            iconName="filter"
            text={info.endpoint}
            href={endpointFilterLink}
          />
        {:else}
          <DetailListTextValue text={info.endpoint} />
        {/if}
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.service-name',
          )}</DetailListLabel
        >
        {#if serviceFilterLink}
          <DetailListLinkValue
            copyable
            iconName="filter"
            text={info.service}
            href={serviceFilterLink}
          />
        {:else}
          <DetailListTextValue text={info.service} />
        {/if}
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.operation-name',
          )}</DetailListLabel
        >
        {#if operationFilterLink}
          <DetailListLinkValue
            copyable
            iconName="filter"
            text={info.operation}
            href={operationFilterLink}
          />
        {:else}
          <DetailListTextValue text={info.operation} />
        {/if}
        <DetailListLabel
          >{translate('standalone-nexus-operations.state')}</DetailListLabel
        >
        <WorkflowStatus status={toNexusOperationStatus(info.status)} />
        {#if info.state}
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.blocked-reason',
            )}</DetailListLabel
          >
          <DetailListTextValue text={info.state} />
        {/if}
        {#if info.blockedReason}
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.blocked-reason',
            )}</DetailListLabel
          >
          <DetailListTextValue text={info.blockedReason} />
        {/if}
        {#if handlerNamespace}
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.handler-namespace',
            )}</DetailListLabel
          >
          {#if handlerNamespaceLink}
            <DetailListLinkValue
              text={handlerNamespace}
              href={handlerNamespaceLink}
            />
          {:else}
            <DetailListTextValue text={handlerNamespace} />
          {/if}
        {/if}
        {#if handlerWorkflowLink}
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.handler-operation-link',
            )}</DetailListLabel
          >
          <DetailListLinkValue
            text={handlerWorkflowEvent?.workflowId ?? ''}
            href={handlerWorkflowLink}
          />
        {/if}
      </DetailList>
      {#if handlerWorkflowLink}
        <p class="text-sm text-secondary">
          {translate('standalone-nexus-operations.handler-namespace-note')}
        </p>
      {/if}
      {#if hasNexusHeader}
        <div class="space-y-2">
          <p class="font-medium text-secondary">
            {translate('standalone-nexus-operations.nexus-header')}
          </p>
          <CodeBlock content={JSON.stringify(info.nexusHeader, null, 2)} />
        </div>
      {/if}
    </div>

    <div class="space-y-4">
      <h6 class="text-secondary">
        {translate('standalone-nexus-operations.timeout-configuration')}
      </h6>
      <DetailList
        rowCount={3}
        aria-label={translate(
          'standalone-nexus-operations.timeout-configuration',
        )}
      >
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.schedule-to-close-timeout',
          )}</DetailListLabel
        >
        <DetailListTextValue text={fromSeconds(info.scheduleToCloseTimeout)} />
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.schedule-to-start-timeout',
          )}</DetailListLabel
        >
        <DetailListTextValue text={fromSeconds(info.scheduleToStartTimeout)} />
        <DetailListLabel
          >{translate(
            'standalone-nexus-operations.start-to-close-timeout',
          )}</DetailListLabel
        >
        <DetailListTextValue text={fromSeconds(info.startToCloseTimeout)} />
      </DetailList>
    </div>

    {#if info.attempt > 1}
      <div class="space-y-4">
        <h6 class="text-secondary">
          {translate('standalone-nexus-operations.attempt-section')}
        </h6>
        <DetailList
          rowCount={3}
          aria-label={translate('standalone-nexus-operations.attempt-section')}
        >
          <DetailListLabel
            >{translate('standalone-nexus-operations.attempt')}</DetailListLabel
          >
          <DetailListTextValue text={String(info.attempt)} />
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.last-attempt-complete-time',
            )}</DetailListLabel
          >
          <DetailListTimestampValue
            timestamp={info.lastAttemptCompleteTime}
            fallback="-"
          />
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.next-attempt-schedule-time',
            )}</DetailListLabel
          >
          <DetailListTimestampValue
            timestamp={info.nextAttemptScheduleTime}
            fallback="-"
          />
        </DetailList>
        {#if hasLastAttemptFailure}
          <div class="space-y-2">
            <p class="font-medium text-secondary">
              {translate('standalone-nexus-operations.last-attempt-failure')}
            </p>
            <CodeBlock
              content={JSON.stringify(info.lastAttemptFailure, null, 2)}
            />
          </div>
        {/if}
      </div>
    {/if}

    {#if info.cancellationInfo}
      <div class="space-y-4">
        <h6 class="text-secondary">
          {translate('standalone-nexus-operations.cancellation-info')}
        </h6>
        <DetailList
          rowCount={5}
          aria-label={translate(
            'standalone-nexus-operations.cancellation-info',
          )}
        >
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.cancellation-requested-time',
            )}</DetailListLabel
          >
          <DetailListTimestampValue
            timestamp={info.cancellationInfo.requestedTime}
            fallback="-"
          />
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.cancellation-state',
            )}</DetailListLabel
          >
          <DetailListTextValue text={info.cancellationInfo.state} />
          <DetailListLabel
            >{translate('standalone-nexus-operations.attempt')}</DetailListLabel
          >
          <DetailListTextValue text={String(info.cancellationInfo.attempt)} />
          <DetailListLabel
            >{translate(
              'standalone-nexus-operations.cancellation-reason',
            )}</DetailListLabel
          >
          <DetailListTextValue text={info.cancellationInfo.reason} />
          {#if info.cancellationInfo.blockedReason}
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.blocked-reason',
              )}</DetailListLabel
            >
            <DetailListTextValue text={info.cancellationInfo.blockedReason} />
          {/if}
        </DetailList>
        {#if info.cancellationInfo.lastAttemptFailure}
          <div class="space-y-2">
            <p class="font-medium text-secondary">
              {translate('standalone-nexus-operations.last-attempt-failure')}
            </p>
            <CodeBlock
              content={JSON.stringify(
                info.cancellationInfo.lastAttemptFailure,
                null,
                2,
              )}
            />
          </div>
        {/if}
      </div>
    {/if}
  </Card>
{/if}

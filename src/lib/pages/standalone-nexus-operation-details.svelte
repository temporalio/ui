<script lang="ts">
  import {
    DetailList,
    DetailListLabel,
    DetailListTextValue,
    DetailListTimestampValue,
  } from '$lib/components/detail-list';
  import NexusOperationInputAndOutcome from '$lib/components/standalone-nexus-operations/nexus-operation-input-and-outcome.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { toNexusOperationStatus } from '$lib/utilities/get-nexus-operation-status-and-count';
  import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';
  import { fromSeconds } from '$lib/utilities/to-duration';

  const info = $derived($nexusOperationExecution?.info);

  const hasLastAttemptFailure = $derived(!!info?.lastAttemptFailure);
  const hasNexusHeader = $derived(
    Object.keys(info?.nexusHeader ?? {}).length > 0,
  );
  const hasCodeBlocks = $derived(hasLastAttemptFailure || hasNexusHeader);

  const identityRowCount = $derived(4 + (info?.operationToken ? 1 : 0));
  const statusRowCount = $derived(
    1 + (info?.state ? 1 : 0) + (info?.blockedReason ? 1 : 0),
  );
</script>

{#if $nexusOperationExecution && info}
  <NexusOperationInputAndOutcome
    input={$nexusOperationExecution.input}
    outcome={$nexusOperationExecution.outcome}
  />
  <Card class="space-y-4">
    <div class={hasCodeBlocks ? 'grid grid-cols-2 gap-4' : ''}>
      <div class={hasCodeBlocks ? 'space-y-4' : 'grid grid-cols-3 gap-4'}>
        <div class="space-y-2">
          <h5>{translate('standalone-nexus-operations.identity-section')}</h5>
          <DetailList
            rowCount={identityRowCount}
            aria-label={translate(
              'standalone-nexus-operations.identity-section',
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
                'standalone-nexus-operations.run-id',
              )}</DetailListLabel
            >
            <DetailListTextValue copyable text={info.runId} />
            {#if info.operationToken}
              <DetailListLabel
                >{translate(
                  'standalone-nexus-operations.operation-token',
                )}</DetailListLabel
              >
              <DetailListTextValue copyable text={info.operationToken} />
            {/if}
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.request-id',
              )}</DetailListLabel
            >
            <DetailListTextValue text={info.requestId} />
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.identity',
              )}</DetailListLabel
            >
            <DetailListTextValue text={info.identity} />
          </DetailList>
        </div>

        <div class="space-y-2">
          <h5>{translate('standalone-nexus-operations.operation-section')}</h5>
          <DetailList
            rowCount={3}
            aria-label={translate(
              'standalone-nexus-operations.operation-section',
            )}
          >
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.endpoint',
              )}</DetailListLabel
            >
            <DetailListTextValue text={info.endpoint} />
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.service',
              )}</DetailListLabel
            >
            <DetailListTextValue text={info.service} />
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.operation',
              )}</DetailListLabel
            >
            <DetailListTextValue text={info.operation} />
          </DetailList>
        </div>

        <div class="space-y-2">
          <h5>{translate('standalone-nexus-operations.status-section')}</h5>
          <DetailList
            rowCount={statusRowCount}
            aria-label={translate('standalone-nexus-operations.status-section')}
          >
            <DetailListLabel
              >{translate('standalone-nexus-operations.state')}</DetailListLabel
            >
            <WorkflowStatus status={toNexusOperationStatus(info.status)} />
            {#if info.state}
              <DetailListLabel
                >{translate(
                  'standalone-nexus-operations.state',
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
          </DetailList>
        </div>

        <div class="space-y-2">
          <h5>{translate('standalone-nexus-operations.timing-section')}</h5>
          <DetailList
            rowCount={4}
            aria-label={translate('standalone-nexus-operations.timing-section')}
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
          </DetailList>
        </div>

        {#if info.attempt > 1}
          <div class="space-y-2">
            <h5>{translate('standalone-nexus-operations.attempt-section')}</h5>
            <DetailList
              rowCount={3}
              aria-label={translate(
                'standalone-nexus-operations.attempt-section',
              )}
            >
              <DetailListLabel
                >{translate(
                  'standalone-nexus-operations.attempt',
                )}</DetailListLabel
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
          </div>
        {/if}

        <div class="space-y-2">
          <h5>
            {translate('standalone-nexus-operations.timeout-configuration')}
          </h5>
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
            <DetailListTextValue
              text={fromSeconds(info.scheduleToCloseTimeout)}
            />
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.schedule-to-start-timeout',
              )}</DetailListLabel
            >
            <DetailListTextValue
              text={fromSeconds(info.scheduleToStartTimeout)}
            />
            <DetailListLabel
              >{translate(
                'standalone-nexus-operations.start-to-close-timeout',
              )}</DetailListLabel
            >
            <DetailListTextValue text={fromSeconds(info.startToCloseTimeout)} />
          </DetailList>
        </div>

        {#if info.cancellationInfo}
          <div class="space-y-2">
            <h5>
              {translate('standalone-nexus-operations.cancellation-info')}
            </h5>
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
                >{translate(
                  'standalone-nexus-operations.attempt',
                )}</DetailListLabel
              >
              <DetailListTextValue
                text={String(info.cancellationInfo.attempt)}
              />
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
                <DetailListTextValue
                  text={info.cancellationInfo.blockedReason}
                />
              {/if}
            </DetailList>
            {#if info.cancellationInfo.lastAttemptFailure}
              <div class="space-y-2">
                <p class="font-medium text-secondary">
                  {translate(
                    'standalone-nexus-operations.last-attempt-failure',
                  )}
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
      </div>

      {#if hasCodeBlocks}
        <div class="space-y-2">
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
          {#if hasNexusHeader}
            <div class="space-y-2">
              <p class="font-medium text-secondary">
                {translate('standalone-nexus-operations.nexus-header')}
              </p>
              <CodeBlock content={JSON.stringify(info.nexusHeader, null, 2)} />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </Card>
{/if}

<script lang="ts">
  import {
    DetailList,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
  } from '$lib/components/detail-list';
  import DetailListValue from '$lib/components/detail-list/detail-list-value.svelte';
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import ActivityExecutionInputAndOutcome from '$lib/components/standalone-activities/activity-input-and-outcome.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Failure } from '$lib/types';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
  } from '$lib/utilities/format-event-attributes';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';
  import { fromSeconds } from '$lib/utilities/to-duration';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const isClosed = $derived(
    $activityExecution?.info?.status !== 'ACTIVITY_EXECUTION_STATUS_RUNNING',
  );

  const isRetrying = $derived(
    $activityExecution?.info?.status === 'ACTIVITY_EXECUTION_STATUS_RUNNING' &&
      ($activityExecution?.info?.attempt ?? 0) > 1,
  );

  const hasCodeBlocks = $derived(
    !!(
      $activityExecution?.info?.lastFailure ||
      $activityExecution?.info?.retryPolicy ||
      $activityExecution?.info?.heartbeatDetails ||
      $activityExecution?.info?.header
    ),
  );
</script>

{#snippet activityExecutionAttemptsBadge(
  attempt: number,
  maximumAttempts: number | null,
  lastFailure: Failure | null,
)}
  {@const failed = attempt > 1 && !!lastFailure}
  {@const badgeType = failed ? 'danger' : 'default'}

  <DetailListLabel class="flex items-center"
    >{translate('standalone-activities.attempt')}</DetailListLabel
  >
  <DetailListValue>
    <Badge type={badgeType} class="flex items-center gap-2">
      <Icon name="retry" class={failed ? 'text-red-400' : ''} />
      <span>{attempt} of {formatMaximumAttempts(maximumAttempts)}</span>
    </Badge>

    {#if maximumAttempts && !isClosed}
      <p class="ml-1 text-secondary">
        {formatAttemptsLeft(maximumAttempts, attempt)} remaining
      </p>
    {/if}
  </DetailListValue>
{/snippet}

{#if $activityExecution}
  <ActivityExecutionInputAndOutcome
    input={$activityExecution.input}
    outcome={$activityExecution.outcome}
  />
  <Card class="space-y-4">
    <h4>{$activityExecution.info.activityType?.name ?? ''}</h4>
    <div class={hasCodeBlocks ? 'grid grid-cols-2 gap-4' : ''}>
      <div class={hasCodeBlocks ? 'space-y-4' : 'grid grid-cols-3 gap-4'}>
        {#if !isClosed}
          <div class="space-y-2">
            <h5>
              {translate('standalone-activities.current-state')}
            </h5>
            <DetailList
              rowCount={2}
              aria-label={translate('standalone-activities.current-state')}
            >
              <DetailListLabel
                >{translate('standalone-activities.run-state')}</DetailListLabel
              >
              <DetailListTextValue
                text={fromScreamingEnum(
                  $activityExecution.info.runState ??
                    'PENDING_ACTIVITY_STATE_UNSPECIFIED',
                  '',
                )}
              />
              {@render activityExecutionAttemptsBadge(
                $activityExecution.info.attempt ?? 0,
                $activityExecution.info.retryPolicy?.maximumAttempts ?? null,
                $activityExecution.info.lastFailure ?? null,
              )}
            </DetailList>
          </div>
        {/if}
        <div class="space-y-2">
          <h5>
            {translate('standalone-activities.timing-and-progress')}
          </h5>
          <DetailList
            rowCount={isClosed
              ? ($activityExecution.info.attempt ?? 0) > 1
                ? 5
                : 4
              : 2}
            aria-label={translate('standalone-activities.timing-and-progress')}
          >
            {#if isClosed}
              <DetailListLabel
                >{translate(
                  'standalone-activities.execution-duration',
                )}</DetailListLabel
              >
              <DetailListTextValue
                text={fromSeconds(
                  $activityExecution.info.executionDuration ?? '',
                )}
              />
              {#if $activityExecution.info.attempt != undefined}
                {#if $activityExecution.info.attempt > 1}
                  {@render activityExecutionAttemptsBadge(
                    $activityExecution.info.attempt,
                    $activityExecution.info.retryPolicy?.maximumAttempts ??
                      null,
                    $activityExecution.info.lastFailure ?? null,
                  )}
                {:else}
                  <DetailListLabel
                    >{translate(
                      'standalone-activities.attempt',
                    )}</DetailListLabel
                  >
                  <DetailListTextValue
                    text={String($activityExecution.info.attempt)}
                  />
                {/if}
              {/if}
            {/if}
            <DetailListLabel
              >{translate(
                'standalone-activities.schedule-time',
              )}</DetailListLabel
            >
            <DetailListTimestampValue
              timestamp={$activityExecution.info.scheduleTime}
            />
            <DetailListLabel
              >{translate(
                'standalone-activities.last-started-time',
              )}</DetailListLabel
            >
            <DetailListTimestampValue
              timestamp={$activityExecution.info.lastStartedTime}
            />
            {#if isClosed}
              <DetailListLabel>{translate('common.end')}</DetailListLabel>
              <DetailListTimestampValue
                timestamp={$activityExecution.info.lastStartedTime}
              />
            {/if}
          </DetailList>
        </div>
        {#if !isClosed}
          <div class="space-y-2">
            <h5>
              {translate('standalone-activities.health')}
            </h5>
            <DetailList
              rowCount={2}
              aria-label={translate('standalone-activities.health')}
            >
              <DetailListLabel
                >{translate(
                  'standalone-activities.last-heartbeat',
                )}</DetailListLabel
              >
              <DetailListTimestampValue
                timestamp={$activityExecution.info.lastHeartbeatTime}
              />
              <DetailListLabel
                >{translate(
                  'standalone-activities.heartbeat-timeout',
                )}</DetailListLabel
              >
              <DetailListTextValue
                text={fromSeconds($activityExecution.info.heartbeatTimeout)}
              />
            </DetailList>
          </div>
        {/if}
        {#if isRetrying}
          <div class="space-y-2">
            <h5>
              {translate('standalone-activities.retry-state')}
            </h5>
            <DetailList
              rowCount={3}
              aria-label={translate('standalone-activities.retry-state')}
            >
              <DetailListLabel
                >{translate(
                  'standalone-activities.current-retry-interval',
                )}</DetailListLabel
              >
              <DetailListTextValue
                text={fromSeconds($activityExecution.info.currentRetryInterval)}
              />

              <DetailListLabel
                >{translate(
                  'standalone-activities.last-attempt-complete-time',
                )}</DetailListLabel
              >
              <DetailListTimestampValue
                timestamp={$activityExecution.info.lastAttemptCompleteTime}
              />

              <DetailListLabel
                >{translate(
                  'standalone-activities.next-attempt-schedule-time',
                )}</DetailListLabel
              >
              <DetailListTimestampValue
                timestamp={$activityExecution.info.nextAttemptScheduleTime}
              />
            </DetailList>
          </div>
        {/if}

        <div class="space-y-2">
          <h5>
            {translate('standalone-activities.timeout-configuration')}
          </h5>
          <DetailList
            rowCount={3}
            aria-label={translate(
              'standalone-activities.timeout-configuration',
            )}
          >
            <DetailListLabel
              >{translate(
                'standalone-activities.schedule-to-start-timeout',
              )}</DetailListLabel
            >
            <DetailListTextValue
              text={fromSeconds($activityExecution.info.scheduleToStartTimeout)}
            />
            <DetailListLabel
              >{translate(
                'standalone-activities.schedule-to-close-timeout',
              )}</DetailListLabel
            >
            <DetailListTextValue
              text={fromSeconds($activityExecution.info.scheduleToCloseTimeout)}
            />
            <DetailListLabel
              >{translate(
                'standalone-activities.start-to-close-timeout',
              )}</DetailListLabel
            >
            <DetailListTextValue
              text={fromSeconds($activityExecution.info.startToCloseTimeout)}
            />
          </DetailList>
        </div>
        <div class="space-y-2">
          <h5>
            {translate('standalone-activities.worker')}
          </h5>
          <DetailList
            rowCount={2}
            aria-label={translate('standalone-activities.worker')}
          >
            <DetailListLabel
              >{translate('standalone-activities.task-queue')}</DetailListLabel
            >
            <DetailListLinkValue
              href={routeForTaskQueue({
                namespace,
                queue: $activityExecution.info.taskQueue ?? '',
              })}
              text={$activityExecution.info.taskQueue ?? ''}
            />

            <DetailListLabel
              >{translate(
                'standalone-activities.last-worker-identity',
              )}</DetailListLabel
            >
            <DetailListTextValue
              text={$activityExecution.info.lastWorkerIdentity ?? ''}
            />
          </DetailList>
        </div>
        {#if $activityExecution.info.priority}
          {@const { priorityKey, fairnessKey, fairnessWeight } =
            $activityExecution.info.priority}
          {@const priorityRowCount =
            (priorityKey ? 1 : 0) +
            (fairnessKey ? 1 : 0) +
            (fairnessWeight ? 1 : 0)}
          {#if priorityRowCount > 0}
            <div class="space-y-2">
              <h5>
                {translate('standalone-activities.priority')}
              </h5>
              <DetailList
                rowCount={priorityRowCount}
                aria-label={translate('standalone-activities.priority')}
              >
                {#if priorityKey}
                  <DetailListLabel
                    >{translate(
                      'standalone-activities.priority-key',
                    )}</DetailListLabel
                  >
                  <DetailListTextValue text={String(priorityKey)} />
                {/if}
                {#if fairnessKey}
                  <DetailListLabel
                    >{translate(
                      'standalone-activities.fairness-key',
                    )}</DetailListLabel
                  >
                  <DetailListTextValue text={fairnessKey} />
                {/if}
                {#if fairnessWeight}
                  <DetailListLabel
                    >{translate(
                      'standalone-activities.fairness-weight',
                    )}</DetailListLabel
                  >
                  <DetailListTextValue text={String(fairnessWeight)} />
                {/if}
              </DetailList>
            </div>
          {/if}
        {/if}
      </div>
      {#if hasCodeBlocks}
        <div class="space-y-2">
          {#if $activityExecution.info.lastFailure}
            <div class="space-y-2">
              <p class="font-medium text-secondary">
                {translate('standalone-activities.last-failure')}
              </p>
              <PayloadCodeBlock
                value={$activityExecution.info.lastFailure}
                label={translate('standalone-activities.last-failure')}
              />
            </div>
          {/if}
          {#if $activityExecution.info.retryPolicy}
            <div class="space-y-2">
              <p class="font-medium text-secondary">
                {translate('standalone-activities.retry-policy')}
              </p>
              <CodeBlock
                content={JSON.stringify(
                  $activityExecution.info.retryPolicy,
                  null,
                  2,
                )}
                label={translate('standalone-activities.retry-policy')}
              />
            </div>
          {/if}
          {#if $activityExecution.info.heartbeatDetails}
            <div class="space-y-2">
              <p class="font-medium text-secondary">
                {translate('standalone-activities.heartbeat-details')}
              </p>
              <PayloadCodeBlock
                value={$activityExecution.info.heartbeatDetails}
                label={translate('standalone-activities.heartbeat-details')}
              />
            </div>
          {/if}
          {#if $activityExecution.info.header?.fields}
            <div class="space-y-2">
              <p class="font-medium text-secondary">
                {translate('standalone-activities.header')}
              </p>
              <PayloadCodeBlock
                value={$activityExecution.info.header.fields}
                label={translate('standalone-activities.header')}
              />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </Card>
{/if}

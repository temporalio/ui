<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import ActivityCommands from '$lib/components/activity/activity-commands.svelte';
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { coreUserStore } from '$lib/stores/core-user';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { PendingActivity } from '$lib/types/events';
  import { activityCommandsEnabled } from '$lib/utilities/activity-commands-enabled';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { formatDuration, getDuration } from '$lib/utilities/format-time';
  import { omit } from '$lib/utilities/omit';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  let {
    activity,
    totalPending,
  }: { activity: PendingActivity; totalPending?: number } = $props();
  const failed = $derived(activity.attempt > 1 && !!activity.lastFailure);
  const isRunning = $derived($workflowRun?.workflow?.isRunning);
  const isPaused = $derived($workflowRun?.workflow?.isPaused);

  let coreUser = coreUserStore();
  let showActivityCommands = $derived(
    activityCommandsEnabled(
      page.data.settings,
      $coreUser,
      page.params.namespace,
    ) &&
      (isRunning || isPaused),
  );
</script>

<div
  class="surface-primary flex flex-1 cursor-default flex-col gap-2 border-b border-subtle p-4"
>
  <div class="flex flex-1 flex-wrap justify-between gap-2">
    <div class="flex flex-wrap items-center space-x-3">
      <WorkflowStatus status={activity.paused ? 'Paused' : activity.state} />
      <h4>{activity.activityType}</h4>
    </div>
    {#if showActivityCommands}
      <ActivityCommands {activity} class="justify-end" />
    {/if}
  </div>
  <div class="flex flex-1 flex-col gap-4 xl:flex-row">
    <div class="flex w-full flex-col gap-1 xl:w-1/2">
      {@render detail(translate('workflows.activity-id'), activity.activityId)}
      {#if activity.paused && activity.pauseInfo}
        {@render detail(
          translate('activities.paused-by'),
          activity.pauseInfo?.manual?.identity || '',
        )}
        {@render detail(
          translate('activities.paused-since'),
          $timestamp(activity.pauseInfo?.pauseTime),
        )}
        {@render detail(
          translate('activities.pause-reason'),
          activity.pauseInfo?.manual?.reason || '-',
        )}
      {/if}
      {@render detail(translate('workflows.attempt'), attempts)}
      {#if activity.scheduledTime}
        {@const timeDifference = toTimeDifference({
          date: activity.scheduledTime,
          negativeDefault: '',
        })}
        {#if timeDifference}
          {@render nextRetry(timeDifference)}
        {/if}
      {/if}
      {#if activity.lastAttemptCompleteTime}
        {@render detail(
          translate('workflows.last-attempt-completed-time'),
          $timestamp(activity.lastAttemptCompleteTime),
        )}
      {/if}
      {#if activity.expirationTime}
        {@render detail(
          translate('workflows.retry-expiration'),
          formatRetryExpiration(
            activity.maximumAttempts,
            formatDuration(
              getDuration({
                start: Date.now(),
                end: activity.expirationTime,
              }),
            ),
          ),
        )}
      {/if}
      {#if activity.lastHeartbeatTime}
        {@render detail(
          translate('workflows.last-heartbeat'),
          $timestamp(activity.lastHeartbeatTime),
        )}
      {/if}
      {#if activity.lastStartedTime}
        {@render detail(
          translate('workflows.last-started-time'),
          $timestamp(activity.lastStartedTime),
        )}
      {/if}
      {#if activity.lastWorkerIdentity}
        {@render detail(
          translate('workflows.last-worker-identity'),
          activity.lastWorkerIdentity,
        )}
      {/if}
      {#if activity.priority}
        {#if activity.priority.priorityKey}
          {@render detail(
            translate('workflows.priority'),
            activity.priority.priorityKey,
          )}
        {/if}
        {#if activity.priority.fairnessKey}
          {@render detail(
            translate('workflows.fairness'),
            activity.priority.fairnessKey,
          )}
        {/if}
      {/if}
    </div>
    <div class="flex w-full flex-col gap-4 md:flex-1 xl:w-1/2">
      {#if failed}
        {#if totalPending > 20}
          {@render failuresAccordion()}
        {:else}
          {@render failuresCodeBlock()}
        {/if}
      {/if}
      {#if activity.heartbeatDetails}
        {@render heartbeat()}
      {/if}
    </div>
  </div>
</div>

{#snippet detail(label: string, value: string | number | Snippet)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {label}
    </p>
    <p class="w-full whitespace-pre-line">
      {#if typeof value === 'string' || typeof value === 'number'}
        {value}
      {:else}
        {@render value?.()}
      {/if}
    </p>
  </div>
{/snippet}

{#snippet heartbeat()}
  <div>
    <p class="text-sm text-secondary/80">
      {translate('workflows.heartbeat-details')}
    </p>
    {#key activity.attempt}
      <PayloadDecoder value={activity.heartbeatDetails} key="payloads">
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {/key}
  </div>
{/snippet}

{#snippet failuresCodeBlock()}
  <div class="flex flex-col gap-2">
    <div class="flex flex-1 flex-col">
      {#if activity.lastFailure}
        <p class="text-sm text-secondary/80">
          {translate('workflows.last-failure')}
        </p>
        {#key activity.attempt}
          <PayloadDecoder value={omit(activity.lastFailure, 'stackTrace')}>
            {#snippet children(decodedValue)}
              <CodeBlock
                content={decodedValue}
                maxHeight={384}
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
              />
            {/snippet}
          </PayloadDecoder>
        {/key}
      {/if}
    </div>
    {#if activity.lastFailure?.stackTrace}
      <div>
        <p class="text-sm text-secondary/80">
          {translate('common.stack-trace')}
        </p>
        <CodeBlock
          language="text"
          maxHeight={384}
          content={activity.lastFailure.stackTrace}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </div>
    {/if}
  </div>
{/snippet}

{#snippet failuresAccordion()}
  <Accordion
    title={activity.lastFailure?.stackTrace
      ? translate('workflows.last-failure-with-stack-trace')
      : translate('workflows.last-failure')}
    let:open
  >
    {#if open}
      {@render failuresCodeBlock()}
    {/if}
  </Accordion>
{/snippet}

{#snippet nextRetry(timeDifference)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {translate('workflows.next-retry')}
    </p>
    <p class="flex w-full items-center gap-1 whitespace-pre-line">
      {$timestamp(activity.scheduledTime, { relativeLabel: '' })}
      <strong>({timeDifference})</strong>
    </p>
  </div>
{/snippet}

{#snippet attempts()}
  <div class="flex flex-wrap items-center gap-1">
    <Badge type={failed ? 'danger' : 'default'}>
      <Icon class="mr-1 {failed && 'font-bold text-red-400'}" name="retry" />
      {activity.attempt ?? 0} of {formatMaximumAttempts(
        activity.maximumAttempts,
      )}
    </Badge>
    {#if activity.maximumAttempts}
      <p class="ml-1 text-sm text-secondary">
        {formatAttemptsLeft(activity.maximumAttempts, activity.attempt)} remaining
      </p>
    {/if}
  </div>
{/snippet}

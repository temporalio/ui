<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { PendingActivity } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { formatDuration, getDuration } from '$lib/utilities/format-time';
  import { isActivityTaskScheduledEvent } from '$lib/utilities/is-event-type';
  import { omit } from '$lib/utilities/omit';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  let { activity }: { activity: PendingActivity } = $props();
  const { namespace, workflow, run } = $derived(page.params);

  const failed = $derived(activity.attempt > 1);
  const scheduledEvent = $derived(
    $fullEventHistory?.find(
      (event) =>
        isActivityTaskScheduledEvent(event) &&
        event.attributes.activityId === activity.activityId,
    ),
  );
</script>

<div
  class="surface-primary flex flex-1 cursor-default flex-col gap-2 border-b border-subtle p-4"
>
  <div class="flex-1">
    <div class="flex flex-wrap items-center space-x-3">
      <WorkflowStatus status={activity.paused ? 'Paused' : activity.state} />
      <h4>{activity.activityType}</h4>
    </div>
  </div>
  <div class="flex flex-col gap-1 xl:flex-row">
    <div class="flex w-full flex-col gap-1 xl:w-1/2">
      {@render detail(translate('workflows.activity-id'), activity.activityId)}
      {@render detail(translate('workflows.attempt'), attempts)}
      {#if activity.scheduledTime}
        {@render detail(translate('workflows.next-retry'), nextRetry)}
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
          formatDate(activity.lastHeartbeatTime, $timeFormat, {
            relative: $relativeTime,
            relativeStrict: true,
          }),
        )}
      {/if}
      {#if activity.lastAttemptCompleteTime}
        {@render detail(
          translate('workflows.last-attempt-completed-time'),
          formatDate(activity.lastAttemptCompleteTime, $timeFormat, {
            relative: $relativeTime,
          }),
        )}
      {/if}
      {#if activity.lastStartedTime}
        {@render detail(
          translate('workflows.last-started-time'),
          formatDate(activity.lastStartedTime, $timeFormat, {
            relative: $relativeTime,
          }),
        )}
      {/if}
      {@render detail(
        translate('workflows.scheduled-event'),
        scheduleEventLink,
      )}
      {#if activity.lastWorkerIdentity}
        {@render detail(
          translate('workflows.last-worker-identity'),
          activity.lastWorkerIdentity,
        )}
      {/if}
    </div>
    <div class="flex w-full flex-col gap-1 xl:w-1/2">
      {#if failed}
        {@render failures()}
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
    <p class="mb-1 text-sm text-secondary/80">
      {translate('workflows.heartbeat-details')}
    </p>
    <PayloadDecoder
      value={activity.heartbeatDetails}
      let:decodedValue
      key="payloads"
    >
      <CodeBlock
        content={decodedValue}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </PayloadDecoder>
  </div>
{/snippet}

{#snippet failures()}
  {#if activity.lastFailure}
    <div>
      <p class="mb-1 text-sm text-secondary/80">
        {translate('workflows.last-failure')}
      </p>
      <CodeBlock
        maxHeight={384}
        content={stringifyWithBigInt(omit(activity.lastFailure, 'stackTrace'))}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
  {#if activity.lastFailure?.stackTrace}
    <div>
      <p class="mb-1 text-sm text-secondary/80">
        {translate('common.stack-trace')}
      </p>
      <CodeBlock
        language="text"
        content={activity.lastFailure.stackTrace}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
{/snippet}

{#snippet scheduleEventLink()}
  <Link
    class="text-primary hover:underline"
    href={routeForEventHistoryEvent({
      namespace: namespace,
      eventId: scheduledEvent?.id,
      workflow,
      run,
    })}>{scheduledEvent?.id}</Link
  >
{/snippet}

{#snippet nextRetry()}
  <div class="flex flex-wrap items-center gap-1">
    {formatDate(activity.scheduledTime, $timeFormat, {
      relative: $relativeTime,
      relativeLabel: '',
    })}
    <strong
      >({toTimeDifference({
        date: activity.scheduledTime,
        negativeDefault: translate('workflows.no-retry'),
      })})</strong
    >
  </div>
{/snippet}

{#snippet attempts()}
  <div class="flex flex-wrap items-center gap-1">
    <Badge class="mr-1 text-nowrap" type={failed ? 'danger' : 'default'}>
      <Icon class="mr-1 {failed && 'font-bold text-red-400'}" name="retry" />
      {activity.attempt ?? 0} of {formatMaximumAttempts(
        activity.maximumAttempts,
      )}
    </Badge>
    {#if activity.maximumAttempts}
      <p class="text-sm text-secondary">
        {formatAttemptsLeft(activity.maximumAttempts, activity.attempt)} remaining
      </p>
    {/if}
  </div>
{/snippet}

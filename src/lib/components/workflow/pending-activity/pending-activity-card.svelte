<script lang="ts">
  import type { Snippet } from 'svelte';

  import ActivityCommands from '$lib/components/activity/activity-commands.svelte';
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { PendingActivity } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { formatDuration, getDuration } from '$lib/utilities/format-time';
  import { omit } from '$lib/utilities/omit';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  let { activity }: { activity: PendingActivity } = $props();
  const failed = $derived(activity.attempt > 1);
</script>

<div
  class="surface-primary flex flex-1 cursor-default flex-col gap-2 border-b border-subtle p-4"
>
  <div class="flex flex-1 justify-between">
    <div class="flex flex-wrap items-center space-x-3">
      <WorkflowStatus status={activity.paused ? 'Paused' : activity.state} />
      <h4>{activity.activityType}</h4>
    </div>
    <ActivityCommands {activity} class="justify-end" />
  </div>
  <div class="flex flex-1 flex-col gap-2 xl:flex-row">
    <div class="w-full overflow-auto xl:w-1/2">
      {#if activity.paused && activity.pauseInfo}
        {@render detail(
          translate('activities.paused-by'),
          activity.pauseInfo?.manual?.identity || '',
        )}
        {@render detail(
          translate('activities.paused-since'),
          formatDate(activity.pauseInfo?.pauseTime, $timeFormat, {
            relative: $relativeTime,
          }),
        )}
        {@render detail(
          translate('activities.pause-reason'),
          activity.pauseInfo?.manual?.reason || '-',
        )}
      {/if}
      {@render detail(translate('workflows.attempt'), attempts)}
      {#if activity.scheduledTime}
        {@render detail(translate('workflows.next-retry'), nextRetry)}
      {/if}
      <!-- {@render detail(translate('workflows.activity-id'), activity.activityId)} -->
      {#if activity.lastAttemptCompleteTime}
        {@render detail(
          translate('workflows.last-attempt-completed-time'),
          formatDate(activity.lastAttemptCompleteTime, $timeFormat, {
            relative: $relativeTime,
          }),
        )}
      {/if}
      <!-- {@render detail(
        translate('workflows.scheduled-event'),
        scheduleEventLink,
      )} -->
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
      {#if activity.lastStartedTime}
        {@render detail(
          translate('workflows.last-started-time'),
          formatDate(activity.lastStartedTime, $timeFormat, {
            relative: $relativeTime,
          }),
        )}
      {/if}
      {#if activity.lastWorkerIdentity}
        {@render detail(
          translate('workflows.last-worker-identity'),
          activity.lastWorkerIdentity,
        )}
      {/if}
    </div>
    <div class="flex w-full flex-col gap-2 md:flex-1 xl:w-1/2">
      {#if failed}
        {@render failures()}
      {/if}
      {#if activity.heartbeatDetails}
        <div>
          <p class="min-w-56 text-sm text-secondary/80">
            {translate('workflows.heartbeat-details')}
          </p>
          <p class="w-full whitespace-pre-line">
            {@render heartbeat()}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

{#snippet detail(label: string, value: string | number | Snippet)}
  <div class="flitems-start flex gap-2">
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
{/snippet}

{#snippet failures()}
  <Accordion
    title={activity.lastFailure?.stackTrace
      ? translate('workflows.last-failure-with-stack-trace')
      : translate('workflows.last-failure')}
  >
    <div class="-mt-4 flex flex-col gap-2">
      <div class="flex flex-1 flex-col">
        {#if activity.lastFailure}
          <p class="text-sm text-secondary/80">
            {translate('workflows.last-failure')}
          </p>
          <CodeBlock
            class="pb-2"
            content={stringifyWithBigInt(
              omit(activity.lastFailure, 'stackTrace'),
            )}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/if}
      </div>
      <div class="flex flex-1 flex-col">
        {#if activity.lastFailure?.stackTrace}
          <p class="text-sm text-secondary/80">
            {translate('common.stack-trace')}
          </p>
          <CodeBlock
            language="text"
            content={activity.lastFailure.stackTrace}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/if}
      </div>
    </div>
  </Accordion>
{/snippet}

{#snippet nextRetry()}
  <div class="flex items-center gap-1">
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
  <div class="flex items-center gap-1">
    <Badge class="mr-1" type={failed ? 'danger' : 'default'}>
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

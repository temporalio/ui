<script lang="ts">
  import { formatDuration } from 'date-fns';

  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { PendingActivity } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    formatAttemptsLeft,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { getDuration } from '$lib/utilities/format-time';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  export let pendingActivity: PendingActivity;

  let failed = pendingActivity.attempt > 1;
</script>

<div class="flex flex-col gap-6 p-4 text-sm">
  <div class="pending-activity-detail">
    <p class="pending-activity-detail-header">
      {translate('workflows.activity-type')}
    </p>
    <Badge type={failed ? 'error' : 'ultraviolet'}>
      {pendingActivity.activityType}
    </Badge>
  </div>
  <div class="pending-activity-detail">
    <p class="pending-activity-detail-header">
      {translate('workflows.last-heartbeat')}
    </p>
    {formatDate(pendingActivity.lastHeartbeatTime, $timeFormat, {
      relative: $relativeTime,
    })}
  </div>
  <div class="pending-activity-detail">
    <p class="pending-activity-detail-header">
      {translate('workflows.attempt')}
    </p>
    <Badge type={failed ? 'error' : 'ultraviolet'}>
      {#if failed}
        <Icon name="retry" />
      {/if}
      {pendingActivity.attempt}
    </Badge>
  </div>
  <div class="pending-activity-detail">
    <p class="pending-activity-detail-header">
      {translate('workflows.attempts-left')}
    </p>
    <Badge type={failed ? 'error' : 'ultraviolet'}>
      {formatAttemptsLeft(
        pendingActivity.maximumAttempts,
        pendingActivity.attempt,
      )}
    </Badge>
  </div>
  {#if failed && pendingActivity.scheduledTime}
    <div class="pending-activity-detail">
      <p class="pending-activity-detail-header">
        {translate('workflows.next-retry')}
      </p>
      <Badge type={failed ? 'error' : 'ultraviolet'}>
        {toTimeDifference({
          date: pendingActivity.scheduledTime,
          negativeDefault: 'None',
        })}
      </Badge>
    </div>
  {/if}
  <div class="pending-activity-detail">
    <p class="pending-activity-detail-header">
      {translate('workflows.expiration')}
    </p>
    {formatRetryExpiration(
      pendingActivity.maximumAttempts,
      formatDuration(
        getDuration({
          start: Date.now(),
          end: pendingActivity.expirationTime,
        }),
      ),
    )}
  </div>
  <div class="pending-activity-failure-details">
    {#if pendingActivity?.heartbeatDetails}
      <div class="w-full">
        <p class="pending-activity-detail-header">
          {translate('workflows.heartbeat-details')}
        </p>
        <CodeBlock
          class="max-h-32 overflow-y-scroll"
          content={stringifyWithBigInt(pendingActivity.heartbeatDetails)}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </div>
    {/if}
    {#if pendingActivity?.lastFailure}
      <div class="w-full">
        <p class="pending-activity-detail-header">
          {translate('workflows.last-failure')}
        </p>
        <CodeBlock
          content={stringifyWithBigInt(pendingActivity.lastFailure)}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .pending-activity-row:last-child .pending-activity-summary {
    @apply border-b-0;
  }

  .pending-activity-inner-row {
    @apply flex flex-col gap-2;
  }

  .pending-activity-detail {
    @apply flex flex-col gap-2 border-b border-white text-white;
  }

  .pending-activity-failure-details {
    @apply flex flex-col gap-2 text-white;
  }
</style>

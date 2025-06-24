<script lang="ts">
  import { page } from '$app/stores';

  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    formatAttemptsLeft,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { formatDuration, getDuration } from '$lib/utilities/format-time';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { routeForPendingActivities } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;

  $: href = routeForPendingActivities({
    namespace: $page.params.namespace,
    workflow: $page.params.workflow,
    run: $page.params.run,
  });

  $: canceled = ['Terminated', 'TimedOut', 'Canceled'].includes(
    workflow?.status,
  );
</script>

{#if pendingActivities.length}
  <section>
    <Accordion
      title={translate('workflows.pending-activities')}
      data-testid="pending-activities"
    >
      <div slot="summary" class="flex items-center gap-2">
        <Badge type="count">{pendingActivities.length}</Badge>
        {#if canceled}
          <Tooltip
            bottom
            text={translate('workflows.pending-activities-canceled')}
          >
            <Badge type="warning" class="py-0"><Icon name="canceled" /></Badge>
          </Tooltip>
        {/if}
      </div>
      <div>
        {#each pendingActivities as { id, ...pendingActivity } (id)}
          {@const failed = pendingActivity.attempt > 1}
          <div class="pending-activity-row-container">
            <h3 class="w-full self-start text-sm text-secondary">
              {pendingActivity.activityId}
            </h3>
            <div class="pending-activity-row">
              <div class="pending-activity-summary">
                <div class="pending-activity-inner-row">
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.activity-type')}
                    </h4>
                    <Badge type={failed ? 'danger' : undefined}>
                      {pendingActivity.activityType}
                    </Badge>
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.last-heartbeat')}
                    </h4>
                    {formatDate(
                      pendingActivity.lastHeartbeatTime,
                      $timeFormat,
                      {
                        relative: $relativeTime,
                      },
                    )}
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.attempt')}
                    </h4>
                    <Badge type={failed ? 'danger' : undefined}>
                      {#if failed}
                        <Icon name="retry" />
                      {/if}
                      {pendingActivity.attempt}
                    </Badge>
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.attempts-left')}
                    </h4>
                    <Badge type={failed ? 'danger' : undefined}>
                      {formatAttemptsLeft(
                        pendingActivity.maximumAttempts,
                        pendingActivity.attempt,
                      )}
                    </Badge>
                  </div>
                  {#if failed && pendingActivity.scheduledTime}
                    {@const timeDifference = toTimeDifference({
                      date: pendingActivity.scheduledTime,
                      negativeDefault: '',
                    })}
                    {#if timeDifference}
                      <div class="pending-activity-detail">
                        <h4 class="pending-activity-detail-header">
                          {translate('workflows.next-retry')}
                        </h4>
                        <Badge type={failed ? 'danger' : undefined}>
                          {timeDifference}
                        </Badge>
                      </div>
                    {/if}
                  {/if}
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.expiration')}
                    </h4>
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
                </div>
                <div class="pending-activity-failure-details">
                  {#if pendingActivity?.heartbeatDetails}
                    <div class="w-1/2 grow">
                      <h4 class="pending-activity-detail-header">
                        {translate('workflows.heartbeat-details')}
                      </h4>
                      <CodeBlock
                        maxHeight={128}
                        content={stringifyWithBigInt(
                          pendingActivity.heartbeatDetails,
                        )}
                        copyIconTitle={translate('common.copy-icon-title')}
                        copySuccessIconTitle={translate(
                          'common.copy-success-icon-title',
                        )}
                      />
                    </div>
                  {/if}
                  {#if pendingActivity?.lastFailure}
                    <div class="w-1/2 grow">
                      <h4 class="pending-activity-detail-header">
                        {translate('workflows.last-failure')}
                      </h4>
                      <CodeBlock
                        maxHeight={128}
                        content={stringifyWithBigInt(
                          pendingActivity.lastFailure,
                        )}
                        copyIconTitle={translate('common.copy-icon-title')}
                        copySuccessIconTitle={translate(
                          'common.copy-success-icon-title',
                        )}
                      />
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      <div class="mt-2 text-right">
        <Link {href}>{translate('workflows.pending-activities-link')}</Link>
      </div>
    </Accordion>
  </section>
{/if}

<style lang="postcss">
  .pending-activity-row-container {
    @apply mt-4;
  }

  .pending-activity-row {
    @apply flex w-full flex-row items-center gap-2;
  }

  .pending-activity-summary {
    @apply w-full overflow-x-scroll border-b border-subtle py-1 text-sm;
  }

  .pending-activity-row:last-child .pending-activity-summary {
    @apply border-b-0;
  }

  .pending-activity-inner-row {
    @apply flex w-full flex-row content-between gap-6;
  }

  .pending-activity-detail {
    @apply w-full whitespace-nowrap xl:flex xl:flex-row xl:items-center xl:gap-2;
  }

  .pending-activity-detail-header {
    @apply font-medium;
  }

  .pending-activity-failure-details {
    @apply flex w-full flex-row gap-4;
  }
</style>

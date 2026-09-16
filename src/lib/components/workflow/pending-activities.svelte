<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { BadgeCount } from '$lib/io/badge-count';
  import { IconCanceled, IconRetry } from '$lib/io/icon';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    formatAttemptsLeft,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { formatDuration, getDuration } from '$lib/utilities/format-time';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { routeForPendingActivities } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  const workflow = $derived($workflowRun.workflow);
  const pendingActivities = $derived(workflow?.pendingActivities ?? []);

  const href = $derived(
    routeForPendingActivities({
      namespace: page.params.namespace,
      workflow: page.params.workflow,
      run: page.params.run,
    }),
  );

  const canceled = $derived(
    ['Terminated', 'TimedOut', 'Canceled'].includes(workflow?.status ?? ''),
  );
</script>

{#if pendingActivities.length}
  <section>
    <Accordion
      title={translate('workflows.pending-activities')}
      data-testid="pending-activities"
    >
      {#snippet summary()}
        <div class="flex items-center gap-2">
          {#if canceled}
            <Tooltip
              bottom
              text={translate('workflows.pending-activities-canceled')}
            >
              <Badge
                colorScheme="warning"
                text={String(pendingActivities.length)}
                Icon={IconCanceled}
              />
            </Tooltip>
          {:else}
            <BadgeCount value={pendingActivities.length} />
          {/if}
        </div>
      {/snippet}
      <div>
        {#each pendingActivities as { id, ...pendingActivity } (id)}
          {@const failed = (pendingActivity.attempt ?? 0) > 1}
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
                    <Badge
                      colorScheme={failed ? 'danger' : 'neutral'}
                      text={pendingActivity.activityType ?? ''}
                    />
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.last-heartbeat')}
                    </h4>
                    <Timestamp dateTime={pendingActivity.lastHeartbeatTime} />
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.attempt')}
                    </h4>
                    <Badge
                      colorScheme={failed ? 'danger' : 'neutral'}
                      text={String(pendingActivity.attempt ?? 0)}
                      Icon={failed ? IconRetry : undefined}
                    />
                  </div>
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.attempts-left')}
                    </h4>
                    <Badge
                      colorScheme={failed ? 'danger' : 'neutral'}
                      text={`${formatAttemptsLeft(
                        pendingActivity.maximumAttempts ?? null,
                        pendingActivity.attempt ?? 0,
                      )}`}
                    />
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
                        <Badge colorScheme="danger" text={timeDifference} />
                      </div>
                    {/if}
                  {/if}
                  <div class="pending-activity-detail">
                    <h4 class="pending-activity-detail-header">
                      {translate('workflows.expiration')}
                    </h4>
                    {formatRetryExpiration(
                      pendingActivity.maximumAttempts ?? 0,
                      formatDuration(
                        getDuration({
                          start: Date.now(),
                          end: pendingActivity.expirationTime,
                        }) ?? '',
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
                        label={translate('workflows.heartbeat-details')}
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
                        label={translate('workflows.last-failure')}
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
    @apply w-full overflow-x-scroll border-b border-primary py-1 text-sm;
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

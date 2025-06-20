<script lang="ts">
  import type { Snippet } from 'svelte';

  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { PendingNexusOperation } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import { omit } from '$lib/utilities/omit';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  let { operation }: { operation: PendingNexusOperation } = $props();

  const failed = $derived(operation.attempt > 1);
</script>

<div
  class="surface-primary flex flex-1 cursor-default flex-col gap-2 border-b border-subtle p-4"
>
  <div class="flex-1">
    <div class="flex flex-wrap items-center space-x-3">
      <Badge>{operation.state}</Badge>
      <h4>{translate('workflows.pending-nexus-operation')}</h4>
    </div>
  </div>

  <div class="flex flex-wrap">
    <div class="flex w-full flex-col gap-1 xl:w-1/2">
      {#if operation.endpoint}
        {@render detail(translate('nexus.endpoint'), operation.endpoint)}
      {/if}
      {#if operation.service}
        {@render detail(translate('nexus.service'), operation.service)}
      {/if}
      {#if operation.operation}
        {@render detail(translate('nexus.operation'), operation.operation)}
      {/if}
      {#if operation.operationToken}
        {@render detail(
          translate('nexus.operation-token'),
          operation.operationToken,
        )}
      {/if}
      {@render detail(translate('workflows.attempt'), attempts)}
      {#if operation.nextAttemptScheduleTime}
        {@render detail(translate('workflows.next-retry'), nextRetry)}
      {/if}
      {#if operation.lastAttemptCompleteTime}
        {@render detail(
          translate('workflows.last-attempt-completed-time'),
          formatDate(operation.lastAttemptCompleteTime, $timeFormat, {
            relative: $relativeTime,
          }),
        )}
      {/if}
      {#if operation.scheduledEventId}
        {@render detail(
          translate('workflows.schedule-event-id'),
          operation.scheduledEventId,
        )}
      {/if}
      {#if operation.scheduledTime}
        {@render detail(
          translate('workflows.scheduled-time'),
          formatDate(operation.scheduledTime, $timeFormat, {
            relative: $relativeTime,
            relativeStrict: true,
          }),
        )}
      {/if}
      {#if operation.scheduleToCloseTimeout}
        {@render detail(
          translate('workflows.schedule-to-close-timeout'),
          operation.scheduleToCloseTimeout as string,
        )}
      {/if}
    </div>
    <div class="flex w-full flex-col gap-1 xl:w-1/2">
      {#if failed}
        {@render failures()}
      {/if}
      {#if operation.blockedReason}
        <div class="flex flex-1 flex-col">
          <p class="text-sm text-secondary/80">
            {translate('nexus.blocked-reason')}
          </p>
          <CodeBlock
            language="text"
            content={operation.blockedReason}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </div>
      {/if}
      {#if Object.keys(operation.cancellationInfo ?? {}).length > 0}
        <div class="flex flex-1 flex-col">
          <p class="text-sm text-secondary/80">
            {translate('nexus.cancellation-info')}
          </p>
          <CodeBlock
            language="text"
            content={stringifyWithBigInt(operation.cancellationInfo)}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

{#snippet nextRetry()}
  <div class="flex items-center gap-1">
    {formatDate(operation.nextAttemptScheduleTime, $timeFormat, {
      relative: $relativeTime,
      relativeLabel: '',
    })}
    <strong
      >({toTimeDifference({
        date: operation.nextAttemptScheduleTime,
        negativeDefault: translate('workflows.no-retry'),
      })})</strong
    >
  </div>
{/snippet}

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

{#snippet attempts()}
  <Badge class="mr-1" type={failed ? 'danger' : 'default'}>
    <Icon class="mr-1 {failed && 'font-bold text-red-400'}" name="retry" />
    {operation.attempt ?? 0}
  </Badge>
{/snippet}

{#snippet failures()}
  {#if operation.lastAttemptFailure}
    <div>
      <p class="text-sm text-secondary/80">
        {translate('workflows.last-failure')}
      </p>
      <CodeBlock
        maxHeight={384}
        content={stringifyWithBigInt(
          omit(operation.lastAttemptFailure, 'stackTrace'),
        )}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}

  {#if operation.lastAttemptFailure?.stackTrace}
    <div>
      <p class="text-sm text-secondary/80">
        {translate('common.stack-trace')}
      </p>
      <CodeBlock
        maxHeight={384}
        language="text"
        content={operation.lastAttemptFailure.stackTrace}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
{/snippet}

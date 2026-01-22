<script lang="ts">
  import type { Snippet } from 'svelte';

  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timestamp } from '$lib/stores/timestamp';
  import type { PendingNexusOperation } from '$lib/types/events';
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

  <div class="flex flex-1 flex-col gap-4 xl:flex-row">
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
        {@const timeDifference = toTimeDifference({
          date: operation.nextAttemptScheduleTime,
          negativeDefault: '',
        })}
        {#if timeDifference}
          {@render nextRetry(timeDifference)}
        {/if}
      {/if}
      {#if operation.lastAttemptCompleteTime}
        {@render detail(
          translate('workflows.last-attempt-completed-time'),
          $timestamp(operation.lastAttemptCompleteTime),
        )}
      {/if}
      {#if operation.scheduledEventId}
        {@render detail(
          translate('workflows.schedule-event-id'),
          String(operation.scheduledEventId),
        )}
      {/if}
      {#if operation.scheduledTime}
        {@render detail(
          translate('workflows.scheduled-time'),
          $timestamp(operation.scheduledTime),
        )}
      {/if}
      {#if operation.scheduleToCloseTimeout}
        {@render detail(
          translate('workflows.schedule-to-close-timeout'),
          operation.scheduleToCloseTimeout as string,
        )}
      {/if}
      {#if operation.scheduleToStartTimeout}
        {@render detail(
          translate('workflows.schedule-to-start-timeout'),
          operation.scheduleToCloseTimeout as string,
        )}
      {/if}
      {#if operation.startToCloseTimeout}
        {@render detail(
          translate('workflows.start-to-close-timeout'),
          operation.startToCloseTimeout as string,
        )}
      {/if}
    </div>
    <div class="flex w-full flex-col gap-4 md:flex-1 xl:w-1/2">
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

{#snippet nextRetry(timeDifference)}
  <div class="flex items-start gap-4">
    <p class="min-w-56 text-sm text-secondary/80">
      {translate('workflows.next-retry')}
    </p>
    <p class="flex w-full items-center gap-1 whitespace-pre-line">
      {$timestamp(operation.nextAttemptScheduleTime, { relativeLabel: '' })}
      <strong>({timeDifference})</strong>
    </p>
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
  <div class="flex flex-col gap-2">
    <div class="flex flex-1 flex-col">
      {#if operation.lastAttemptFailure}
        <p class="text-sm text-secondary/80">
          {translate('workflows.last-failure')}
        </p>
        <CodeBlock
          content={stringifyWithBigInt(
            omit(operation.lastAttemptFailure, 'stackTrace'),
          )}
          maxHeight={384}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/if}
    </div>
    <div class="flex flex-1 flex-col">
      {#if operation.lastAttemptFailure?.stackTrace}
        <p class="text-sm text-secondary/80">
          {translate('common.stack-trace')}
        </p>
        <CodeBlock
          language="text"
          maxHeight={384}
          content={operation.lastAttemptFailure.stackTrace}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/if}
    </div>
  </div>
{/snippet}

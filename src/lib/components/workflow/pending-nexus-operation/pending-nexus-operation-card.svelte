<script lang="ts">
  import { omit } from 'es-toolkit';
  import type { Snippet } from 'svelte';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PendingNexusOperation } from '$lib/types/events';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  let { operation }: { operation: PendingNexusOperation } = $props();

  const failed = $derived((operation.attempt ?? 0) > 1);
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

  <div class="grid min-w-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-2">
    <div class="flex min-w-0 flex-col gap-1.5">
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
          operation.scheduleToStartTimeout as string,
        )}
      {/if}
      {#if operation.startToCloseTimeout}
        {@render detail(
          translate('workflows.start-to-close-timeout'),
          operation.startToCloseTimeout as string,
        )}
      {/if}
    </div>
    <div class="flex min-w-0 flex-col gap-3">
      {#if failed}
        {@render failures()}
      {/if}
      {#if operation.blockedReason}
        <div class="flex flex-1 flex-col">
          <p class="text-xs font-medium leading-5 text-secondary">
            {translate('nexus.blocked-reason')}
          </p>
          <CodeBlock
            language="text"
            content={operation.blockedReason}
            label={translate('nexus.blocked-reason')}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </div>
      {/if}
      {#if Object.keys(operation.cancellationInfo ?? {}).length > 0}
        <div class="flex flex-1 flex-col">
          <p class="text-xs font-medium leading-5 text-secondary">
            {translate('nexus.cancellation-info')}
          </p>
          <CodeBlock
            language="text"
            content={stringifyWithBigInt(operation.cancellationInfo)}
            label={translate('nexus.cancellation-info')}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

{#snippet nextRetry(timeDifference: string)}
  <div
    class="grid min-w-0 grid-cols-1 items-start gap-1 sm:grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] sm:gap-3"
  >
    <p class="text-xs font-medium leading-5 text-secondary">
      {translate('workflows.next-retry')}
    </p>
    <p
      class="flex min-w-0 items-center gap-1 whitespace-pre-line text-sm leading-5"
    >
      {$timestamp(operation.nextAttemptScheduleTime, { relativeLabel: '' })}
      <strong>({timeDifference})</strong>
    </p>
  </div>
{/snippet}

{#snippet detail(label: string, value: string | number | Snippet)}
  <div
    class="grid min-w-0 grid-cols-1 items-start gap-1 sm:grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] sm:gap-3"
  >
    <p class="text-xs font-medium leading-5 text-secondary">
      {label}
    </p>
    <p class="min-w-0 whitespace-pre-line break-words text-sm leading-5">
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
    <Icon class="mr-1 {failed && 'font-bold text-danger'}" name="retry" />
    {operation.attempt ?? 0}
  </Badge>
{/snippet}

{#snippet failures()}
  <div class="flex flex-col gap-2">
    <div class="flex flex-1 flex-col">
      {#if operation.lastAttemptFailure}
        <p class="text-xs font-medium leading-5 text-secondary">
          {translate('workflows.last-failure')}
        </p>
        <CodeBlock
          content={stringifyWithBigInt(
            omit(operation.lastAttemptFailure, ['stackTrace']),
          )}
          label={translate('workflows.last-failure')}
          maxHeight={384}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/if}
    </div>
    <div class="flex flex-1 flex-col">
      {#if operation.lastAttemptFailure?.stackTrace}
        <p class="text-xs font-medium leading-5 text-secondary">
          {translate('common.stack-trace')}
        </p>
        <CodeBlock
          language="text"
          maxHeight={384}
          content={operation.lastAttemptFailure.stackTrace}
          label={translate('common.stack-trace')}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/if}
    </div>
  </div>
{/snippet}

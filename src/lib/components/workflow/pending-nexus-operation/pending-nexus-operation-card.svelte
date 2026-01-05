<script lang="ts">
  import { cva } from 'class-variance-authority';
  import type { Snippet } from 'svelte';

  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import type { PendingNexusOperation } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import { omit } from '$lib/utilities/omit';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  let { operation }: { operation: PendingNexusOperation } = $props();

  const failed = $derived(operation.attempt > 1);

  const pendingStatus = cva(
    ['flex flex-1 flex-col overflow-hidden rounded-t-lg pb-2 text-white'],
    {
      variants: {
        status: {
          retrying: 'bg-red-800',
          pending: 'bg-slate-900/50',
        },
      },
    },
  );
</script>

<div
  class={pendingStatus({
    status: operation.attempt > 1 ? 'retrying' : 'pending',
  })}
>
  <div class="bg-slate-900/80 p-2 text-left">
    <div class="flex flex-col items-center justify-between lg:flex-row">
      <Badge>{operation.state}</Badge>
      <p class="font-medium leading-tight">
        {translate('workflows.pending-nexus-operation')}
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-0.5 p-2 md:grid-cols-2 xl:grid-cols-1">
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
        formatDate(operation.lastAttemptCompleteTime, $timeFormat, {
          relative: $relativeTime,
        }),
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
        formatDate(operation.scheduledTime, $timeFormat, {
          relative: $relativeTime,
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
  <div class="flex w-full flex-col gap-4 p-2">
    {#if failed}
      {@render failures()}
    {/if}
    {#if operation.blockedReason}
      <div class="flex flex-1 flex-col">
        <p class="text-sm">
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
        <p class="text-sm">
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

{#snippet nextRetry(timeDifference)}
  <div class="leading-3">
    <p class="text-sm text-white/70">
      {translate('workflows.next-retry')}
    </p>
    <p class="flex w-full items-center gap-1 whitespace-pre-line">
      {formatDate(operation.nextAttemptScheduleTime, $timeFormat, {
        relative: $relativeTime,
        format: $timestampFormat,
        relativeLabel: '',
      })}
      <strong>({timeDifference})</strong>
    </p>
  </div>
{/snippet}

{#snippet detail(label: string, value: string | number | Snippet)}
  <div class="leading-3">
    <p class="text-sm text-white/70">
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
        <p class="text-sm">
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
        <p class="text-sm">
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

<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Callback } from '$lib/types/nexus';

  let { callback }: { callback: Callback } = $props();

  const EMPTY = '-';

  const formatTime = (time: Callback['registrationTime']) =>
    time ? $timestamp(time) : EMPTY;

  const fields = $derived([
    {
      id: 'registration-time',
      label: translate('nexus.callback-registered-time'),
      value: formatTime(callback.registrationTime),
    },
    {
      id: 'attempt',
      label: translate('nexus.delivery-attempt'),
      value: callback.attempt ? String(callback.attempt) : EMPTY,
    },
    {
      id: 'last-attempt-complete-time',
      label: translate('nexus.last-attempt-completed-time'),
      value: formatTime(callback.lastAttemptCompleteTime),
    },
    {
      id: 'next-attempt-schedule-time',
      label: translate('nexus.next-attempt-scheduled-time'),
      value: formatTime(callback.nextAttemptScheduleTime),
    },
    {
      id: 'blocked-reason',
      label: translate('nexus.blocked-reason'),
      value: callback.blockedReason || EMPTY,
    },
  ]);

  const failure = $derived(callback.lastAttemptFailure);
</script>

<div class="flex flex-col gap-6 p-6 md:flex-row" data-testid="callback-details">
  <dl class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="flex items-center gap-4">
      <dt class="font-medium">{translate('common.request-id')}</dt>
      <dd class="text-secondary">
        {#if callback.requestId}
          <Copyable
            content={callback.requestId}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          >
            <span data-testid="callback-detail-request-id"
              >{callback.requestId}</span
            >
          </Copyable>
        {:else}
          <span data-testid="callback-detail-request-id">{EMPTY}</span>
        {/if}
      </dd>
    </div>
    {#each fields as { id, label, value } (id)}
      <div class="flex items-center gap-4">
        <dt class="font-medium">{label}</dt>
        <dd class="text-secondary" data-testid="callback-detail-{id}">
          {value}
        </dd>
      </div>
    {/each}
  </dl>
  {#if failure}
    <div
      class="flex min-w-0 flex-1 flex-col gap-1"
      data-testid="callback-detail-last-attempt-failure"
    >
      <p class="text-xs font-semibold">
        {translate('nexus.last-attempt-failure')}
      </p>
      <CodeBlock
        content={JSON.stringify(failure, null, 2)}
        label={translate('nexus.last-attempt-failure')}
        language="json"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
</div>

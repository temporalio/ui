<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import {
    formatAttemptsLeft,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { getDuration } from '$lib/utilities/format-time';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';
  import { formatDuration } from 'date-fns';

  export let event: PendingActivity;

  $: failed = event.attempt > 1;
</script>

<div class="flex flex-col gap-4">
  <div class="flex w-full flex-row gap-4">
    {#if event?.heartbeatDetails}
      <div class="w-1/2 grow">
        <p class="text-[12px]">Heartbeat Details</p>
        <CodeBlock class="max-h-32" content={event.heartbeatDetails} />
      </div>
    {/if}
    {#if event?.lastFailure}
      <div class="w-1/2 grow">
        <p class="text-[12px]">Last Failure</p>
        <CodeBlock class="max-h-32" content={event.lastFailure} />
      </div>
    {/if}
  </div>
  <div class="grid grid-cols-4 gap-4">
    <div class="cell">
      <p class="text-[12px]">Attempt</p>
      <Badge type={failed ? 'error' : 'default'}>
        {event.attempt}
      </Badge>
    </div>
    <div class="cell">
      <p class="text-[12px]">Attempts Left</p>
      <Badge type={failed ? 'error' : 'default'}>
        {formatAttemptsLeft(event.maximumAttempts, event.attempt)}
      </Badge>
    </div>
    {#if failed && event.scheduledTime}
      <div class="cell">
        <p class="text-[12px]">Next Retry</p>
        <Badge type={failed ? 'error' : 'default'}>
          {toTimeDifference(event.scheduledTime)}
        </Badge>
      </div>
    {/if}
    <div class="cell">
      <p class="text-[12px]">Expiration</p>
      {formatRetryExpiration(
        event.maximumAttempts,
        formatDuration(
          getDuration({
            start: Date.now(),
            end: event.expirationTime,
          }),
        ),
      )}
    </div>
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply flex h-auto items-center justify-start gap-1;
  }

  .col-1 {
    @apply grid-cols-1;
  }
</style>

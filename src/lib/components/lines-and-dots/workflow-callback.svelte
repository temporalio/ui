<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timeFormat } from '$lib/stores/time-format';
  import type { CallbackInfo } from '$lib/types';
  import { formatDate } from '$lib/utilities/format-date';

  export let callback: CallbackInfo;

  $: completedTime = formatDate(callback.lastAttemptCompleteTime, $timeFormat);
  $: nextTime = formatDate(callback.nextAttemptScheduleTime, $timeFormat);
  $: failure = callback?.lastAttemptFailure?.message;

  const titles = {
    Standby: translate('nexus.callback.standby'),
    Scheduled: translate('nexus.callback.scheduled'),
    'Backing Off': translate('nexus.callback.backing-off'),
    Failed: translate('nexus.callback.failed'),
    Succeeded: translate('nexus.callback.succeeded'),
  };

  $: title = titles[callback.state] || translate('nexus.nexus-callback');
</script>

<Alert icon="nexus" intent="info" {title}>
  <div class="flex flex-col gap-2 pt-2">
    <div class="flex items-center gap-2">
      <p>
        {translate('common.url')}
        <span class="badge">{callback.callback.nexus.url}</span>
      </p>
    </div>
    <div class="flex flex-col items-start gap-2 md:flex-row md:items-center">
      <p>
        {translate('common.state')} <span class="badge">{callback.state}</span>
      </p>
      {#if callback.attempt}
        <p>
          {translate('common.attempt')}
          <span class="badge">{callback.attempt}</span>
        </p>
      {/if}
      {#if callback.lastAttemptCompleteTime}
        <p>
          {translate('nexus.last-attempt-completed-time')}
          <span class="badge">{completedTime}</span>
        </p>
      {/if}
      {#if callback.nextAttemptScheduleTime}
        <p>
          {translate('nexus.next-attempt-scheduled-time')}
          <span class="badge">{nextTime}</span>
        </p>
      {/if}
    </div>
    {#if failure}
      <div class="flex flex-col gap-2">
        <p>{translate('nexus.last-attempt-failure')}</p>
        <CodeBlock
          content={failure}
          language="text"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </div>
    {/if}
  </div>
</Alert>

<style lang="postcss">
  .badge {
    @apply inline-flex items-center gap-1 rounded-sm bg-subtle px-1 py-0.5 font-medium;
  }
</style>

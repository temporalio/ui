<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowStatus } from '$lib/types/workflows';

  import HeartBeat from './heart-beat-indicator.svelte';

  type Status = WorkflowStatus | 'Paused';

  export let status: Status = 'Running';
  export let delay = 0;

  const humanFriendlyNames: Partial<Record<Status, string>> = {
    Running: translate('workflows', 'running'),
    TimedOut: translate('workflows', 'timed-out'),
    Completed: translate('workflows', 'completed'),
    Failed: translate('workflows', 'failed'),
    ContinuedAsNew: translate('workflows', 'continued-as-new'),
    Canceled: translate('workflows', 'canceled'),
    Terminated: translate('workflows', 'terminated'),
    Paused: translate('workflows', 'paused'),
  };
</script>

<span class="flex text-center text-sm font-medium leading-4">
  <span
    class="flex items-center rounded-sm px-1 py-0.5 font-secondary"
    class:status-running={status === 'Running'}
    class:status-timed-out={status === 'TimedOut'}
    class:status-completed={status === 'Completed'}
    class:status-continued-as-new={status === 'ContinuedAsNew'}
    class:status-canceled={status === 'Canceled'}
    class:status-terminated={status === 'Terminated'}
    class:status-paused={status === 'Paused'}
    class:status-failed={status === 'Failed'}
  >
    <span class="whitespace-nowrap">{humanFriendlyNames[status]}</span>
    {#if status === 'Running'}
      <HeartBeat {delay} />
    {/if}
  </span>
</span>

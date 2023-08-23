<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import type { ScheduleStatus } from '$lib/types/schedule';

  import HeartBeat from './heart-beat-indicator.svelte';

  type Status = WorkflowStatus | ScheduleStatus;

  export let delay = 0;
  export let status: Status = 'Running';

  const humanFriendlyNames: Partial<Record<Status, string>> = {
    Running: translate('workflows', 'running'),
    TimedOut: translate('workflows', 'timed-out'),
    Completed: translate('workflows', 'completed'),
    Failed: translate('workflows', 'failed'),
    ContinuedAsNew: translate('workflows', 'continued-as-new'),
    Canceled: translate('workflows', 'canceled'),
    Terminated: translate('workflows', 'terminated'),
    Paused: translate('workflows', 'paused'),
    Canceled: {
      label: translate('workflows', 'canceled'),
      className: 'status-canceled',
    },
    Terminated: {
      label: translate('workflows', 'terminated'),
      className: 'status-terminated',
    },
    Paused: {
      label: translate('workflows', 'paused'),
      className: 'status-paused',
    },
  };
</script>

<Badge class="status-{formatStatus(status)}">
  <span class="whitespace-nowrap">
    {humanFriendlyNames[status]}
  </span>
  {#if status === 'Running'}
    <HeartBeat {delay} />
  {/if}
</Badge>

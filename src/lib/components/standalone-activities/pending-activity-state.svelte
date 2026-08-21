<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import type { I18nKey } from '$lib/i18n';
  import { translate } from '$lib/i18n/translate';
  import type { PendingActivityState } from '$lib/types/activity-execution';

  interface Props {
    runState: PendingActivityState | undefined;
    class?: ClassNameValue;
  }

  const stateLabelKeys: Record<PendingActivityState, I18nKey> = {
    PENDING_ACTIVITY_STATE_UNSPECIFIED:
      'standalone-activities.run-state-unspecified',
    PENDING_ACTIVITY_STATE_SCHEDULED:
      'standalone-activities.run-state-scheduled',
    PENDING_ACTIVITY_STATE_STARTED: 'standalone-activities.run-state-started',
    PENDING_ACTIVITY_STATE_CANCEL_REQUESTED:
      'standalone-activities.run-state-cancel-requested',
    PENDING_ACTIVITY_STATE_PAUSED: 'standalone-activities.run-state-paused',
    PENDING_ACTIVITY_STATE_PAUSE_REQUESTED:
      'standalone-activities.run-state-pause-requested',
  };

  const stateColors: Record<PendingActivityState, string> = {
    PENDING_ACTIVITY_STATE_UNSPECIFIED: 'bg-slate-100',
    PENDING_ACTIVITY_STATE_SCHEDULED: 'bg-blue-300',
    PENDING_ACTIVITY_STATE_STARTED: 'bg-blue-300',
    PENDING_ACTIVITY_STATE_CANCEL_REQUESTED: 'bg-yellow-200',
    PENDING_ACTIVITY_STATE_PAUSED: 'bg-yellow-200',
    PENDING_ACTIVITY_STATE_PAUSE_REQUESTED: 'bg-yellow-200',
  };

  let { runState, class: className, ...rest }: Props = $props();

  const state: PendingActivityState = $derived(
    runState && runState in stateLabelKeys
      ? runState
      : 'PENDING_ACTIVITY_STATE_UNSPECIFIED',
  );
</script>

<span
  class={merge(
    'flex h-5 w-fit items-center whitespace-nowrap rounded-sm px-1 py-0.5 text-xs font-medium leading-4 text-black',
    stateColors[state],
    className,
  )}
  data-testid="pending-activity-state"
  {...rest}
>
  {translate(stateLabelKeys[state])}
</span>

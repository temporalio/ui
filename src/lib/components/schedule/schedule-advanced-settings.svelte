<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import { formatDuration } from '$lib/utilities/format-time';
  import { getScheduleSpecLabel } from '$lib/utilities/schedule-spec-label';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import type { DescribeScheduleResponse, Timestamp } from '$types';

  type Props = {
    schedule: DescribeScheduleResponse;
  };
  let { schedule }: Props = $props();

  const spec = $derived(schedule?.schedule?.spec);
  const state = $derived(schedule?.schedule?.state);
  const policies = $derived(schedule?.schedule?.policies);
  const notes = $derived(schedule?.schedule?.state?.notes);
</script>

{#snippet Info(header: string, value: string | Timestamp)}
  <div class="flex w-full flex-col gap-0 text-sm">
    <p class="text-secondary">
      {header}
    </p>
    <p>
      {value}
    </p>
  </div>
{/snippet}

<Accordion title={translate('schedules.advanced-settings')} open>
  <div class="flex w-full flex-col gap-4">
    <div class="flex items-center gap-4">
      {@render Info(
        translate('common.start-date'),
        spec?.startTime ?? translate('common.none'),
      )}
      {@render Info(
        translate('common.end-date'),
        spec?.endTime ?? translate('common.never'),
      )}
    </div>
    <div class="flex items-center gap-4">
      {@render Info(
        translate('schedules.jitter'),
        spec?.jitter ?? translate('common.none'),
      )}
      {@render Info(
        translate('schedules.overlap-policy'),
        fromScreamingEnum(policies?.overlapPolicy, 'ScheduleOverlapPolicy') ??
          translate('common.none'),
      )}
    </div>
    <div class="flex items-center gap-4">
      {@render Info(
        translate('schedules.catchup-window-policy'),
        policies?.catchupWindow != null
          ? formatDuration(policies.catchupWindow.toString())
          : translate('common.none'),
      )}
      {@render Info(
        translate('schedules.pause-on-failure'),
        policies?.pauseOnFailure
          ? translate('common.true')
          : translate('common.false'),
      )}
    </div>
    <div class="flex items-center gap-4">
      {@render Info(
        translate('schedules.exclusion-calendar'),
        spec?.excludeCalendar
          ? (getScheduleSpecLabel({
              structuredCalendar: spec.excludeCalendar,
            }) ?? translate('common.none'))
          : translate('common.none'),
      )}
      {#if state.limitedActions}
        {@render Info(
          translate('schedules.remaining-actions'),
          state?.remainingActions ?? translate('common.none'),
        )}
      {/if}
      {#if policies?.keepOriginalWorkflowId != null}
        {@render Info(
          translate('schedules.keep-original-workflow-id'),
          policies?.keepOriginalWorkflowId
            ? translate('common.true')
            : translate('common.false'),
        )}
      {/if}
    </div>
    <div class="flex items-center gap-4">
      {@render Info(
        translate('common.notes'),
        notes ?? translate('common.none'),
      )}
    </div>
  </div>
</Accordion>

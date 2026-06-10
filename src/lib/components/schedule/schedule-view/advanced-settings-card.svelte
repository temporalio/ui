<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import { formatDuration } from '$lib/utilities/format-time';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import { summarizeScheduleSpec } from '../utilities/summarize';

  import type { DescribeFullSchedule } from '$types/schedule';

  type Props = {
    schedule: DescribeFullSchedule;
  };
  let { schedule }: Props = $props();

  const spec = $derived(schedule?.schedule?.spec);
  const state = $derived(schedule?.schedule?.state);
  const policies = $derived(schedule?.schedule?.policies);
  const notes = $derived(schedule?.schedule?.state?.notes);
</script>

{#snippet Info(header: string, value: string)}
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
        spec?.startTime ? $timestamp(spec.startTime) : translate('common.none'),
      )}
      {@render Info(
        translate('common.end-date'),
        spec?.endTime ? $timestamp(spec.endTime) : translate('common.never'),
      )}
      {@render Info(translate('common.timezone'), spec?.timezoneName ?? 'UTC')}
    </div>
    <div class="flex items-center gap-4">
      {@render Info(
        translate('schedules.jitter'),
        spec?.jitter ? String(spec.jitter) : translate('common.none'),
      )}
      {@render Info(
        translate('schedules.overlap-policy'),
        String(
          fromScreamingEnum(policies?.overlapPolicy, 'ScheduleOverlapPolicy') ??
            translate('common.none'),
        ),
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
        spec?.excludeStructuredCalendar
          ? summarizeScheduleSpec({
              structuredCalendar: spec.excludeStructuredCalendar,
              timezoneName: spec.timezoneName,
            }) || translate('common.none')
          : translate('common.none'),
      )}
      {#if state.limitedActions}
        {@render Info(
          translate('schedules.remaining-actions'),
          state?.remainingActions?.toString() ?? translate('common.none'),
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

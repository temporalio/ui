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

<Accordion title={translate('schedules.advanced-settings')} open>
  <dl class="grid grid-cols-2 gap-4 text-sm">
    <div>
      <dt class="text-secondary">{translate('common.start-date')}</dt>
      <dd>
        {spec?.startTime
          ? $timestamp(spec.startTime)
          : translate('common.none')}
      </dd>
    </div>

    <div>
      <dt class="text-secondary">{translate('common.end-date')}</dt>
      <dd>
        {spec?.endTime ? $timestamp(spec.endTime) : translate('common.never')}
      </dd>
    </div>

    <div>
      <dt class="text-secondary">{translate('common.timezone-label')}</dt>
      <dd>
        {spec?.timezoneName || 'UTC'}
      </dd>
    </div>

    <div>
      <dt class="text-secondary">{translate('schedules.jitter')}</dt>
      <dd>
        {spec?.jitter && spec.jitter !== '0s'
          ? String(spec.jitter)
          : translate('common.none')}
      </dd>
    </div>

    <div>
      <dt class="text-secondary">{translate('schedules.overlap-policy')}</dt>
      <dd>
        {String(
          fromScreamingEnum(policies?.overlapPolicy, 'ScheduleOverlapPolicy') ??
            translate('common.none'),
        )}
      </dd>
    </div>

    <div>
      <dt class="text-secondary">
        {translate('schedules.catchup-window-policy')}
      </dt>
      <dd>
        {policies?.catchupWindow != null
          ? formatDuration(policies.catchupWindow.toString())
          : translate('common.none')}
      </dd>
    </div>

    <div>
      <dt class="text-secondary">
        {translate('schedules.pause-on-failure')}
      </dt>
      <dd>
        {policies?.pauseOnFailure
          ? translate('common.true')
          : translate('common.false')}
      </dd>
    </div>

    <div>
      <dt class="text-secondary">
        {translate('schedules.exclusion-calendar')}
      </dt>
      <dd>
        {(spec?.excludeStructuredCalendar &&
          summarizeScheduleSpec({
            structuredCalendar: spec.excludeStructuredCalendar,
            timezoneName: spec.timezoneName,
          })) ||
          translate('common.none')}
      </dd>
    </div>

    {#if state.limitedActions}
      <div>
        <dt class="text-secondary">
          {translate('schedules.remaining-actions')}
        </dt>
        <dd>
          {state?.remainingActions?.toString() ?? translate('common.none')}
        </dd>
      </div>
    {/if}

    {#if policies?.keepOriginalWorkflowId != null}
      <div>
        <dt class="text-secondary">
          {translate('schedules.keep-original-workflow-id')}
        </dt>
        <dd>
          {policies?.keepOriginalWorkflowId
            ? translate('common.true')
            : translate('common.false')}
        </dd>
      </div>
    {/if}

    <div class="col-span-full">
      <dt class="text-secondary">
        {translate('common.notes')}
      </dt>
      <dd>
        {notes ?? translate('common.none')}
      </dd>
    </div>
  </dl>
</Accordion>

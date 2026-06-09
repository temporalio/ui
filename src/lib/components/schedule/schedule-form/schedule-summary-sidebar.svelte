<script lang="ts">
  import type { Readable } from 'svelte/store';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { FormScheduleSchema } from '../schema/form';
  import { getScheduleSpecSummary } from '../utilities/summarize';

  interface Props {
    form: Readable<FormScheduleSchema>;
  }

  let { form }: Props = $props();

  const timing = $derived({
    timezoneName: $form.timezoneName,
    startTime: $form.startTime,
    endTime: $form.endTime,
    endAfterOccurrences: $form.endAfterOccurrences,
  });

  const endDisplay = $derived.by(() => {
    switch ($form.endKind) {
      case 'never': {
        return translate('common.never');
      }

      case 'on': {
        if ($form.endTime) {
          return $timestamp($form.endTime);
        }
        break;
      }

      case 'after': {
        if ($form.endAfterOccurrences) {
          return translate('schedules.after-n-occurrence', {
            count: $form.endAfterOccurrences,
          });
        }
        break;
      }
    }

    return '--';
  });

  const descriptionDisplay = $derived.by(() => {
    const specs = $form.specs
      .map((spec, i) => {
        const summary = getScheduleSpecSummary(spec, timing);
        if (i === 0) {
          return summary;
        }

        return summary.toLowerCase();
      })
      .filter(Boolean)
      .join(` ${translate('schedules.summary-spec-conjunction')} `);

    return specs ? `${specs}.` : '--';
  });
</script>

<Card class="w-full">
  <h2 class="text-lg font-semibold">{translate('schedules.summary-title')}</h2>
  <dl class="mt-4 flex flex-col gap-3">
    <div>
      <dt class="text-xs text-secondary">
        {translate('schedules.name-input-label')}
      </dt>
      <dd class="text-sm">{$form.name || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">
        {translate('schedules.summary-start-date-label')}
      </dt>
      <dd class="text-sm">
        {$form.startTime ? $timestamp($form.startTime) : '--'}
      </dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">
        {translate('schedules.summary-end-label')}
      </dt>
      <dd class="text-sm">{endDisplay}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">
        {translate('schedules.summary-workflow-type-label')}
      </dt>
      <dd class="text-sm">{$form.workflowType || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">{translate('common.task-queue')}</dt>
      <dd class="text-sm">{$form.taskQueue || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">
        {translate('common.description')}
      </dt>
      <dd class="flex flex-col text-sm">
        {descriptionDisplay}
      </dd>
    </div>
  </dl>
</Card>

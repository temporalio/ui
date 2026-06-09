<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';
  import { twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';

  import type { FormScheduleSchema } from '../schema/form';
  import { getScheduleSpecSummary } from '../utilities/summarize';

  interface Props {
    form: SuperForm<FormScheduleSchema>['form'];
    index: number;
    class?: string;
  }

  let { form, index, class: className }: Props = $props();

  const spec = $derived($form.specs[index]);

  const timing = $derived({
    timezoneName: $form.timezoneName,
    startTime: $form.startTime,
    endTime: $form.endTime,
    endAfterOccurrences: $form.endAfterOccurrences,
  });

  const preview = $derived.by(() => {
    console.log({ spec: $form.specs[index] });
    if (spec.kind === 'cron' && !spec.cronString) {
      return translate('schedules.spec-preview-example', {
        summary: getScheduleSpecSummary(spec, timing),
      });
    }

    if (spec.kind === 'interval' && !spec.interval.interval) {
      return translate('schedules.spec-preview-interval-empty');
    }

    return getScheduleSpecSummary(spec, timing);
  });
</script>

<div class={twMerge('border border-subtle p-8', className)}>
  <p class="font-mono text-xs">{preview}.</p>
</div>

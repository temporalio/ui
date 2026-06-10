<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';
  import { twJoin, twMerge } from 'tailwind-merge';

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

  const isEmpty = $derived.by(() => {
    if (spec.kind === 'cron' && !spec.cronString) {
      return true;
    }
    if (spec.kind === 'interval' && !spec.interval.interval) {
      console.log(spec.interval);
      return true;
    }

    return false;
  });

  const preview = $derived.by(() => {
    if (spec.kind === 'cron' && !spec.cronString) {
      return translate('schedules.spec-preview-example', {
        summary: getScheduleSpecSummary({ ...spec, cronString: '* * * * *' }),
      });
    }

    if (spec.kind === 'interval' && !spec.interval.interval) {
      return translate('schedules.spec-preview-interval-empty');
    }

    return getScheduleSpecSummary(spec);
  });
</script>

<div class={twMerge('border border-subtle p-8', className)}>
  <p class={twJoin('font-mono text-xs', isEmpty && 'italic')}>{preview}.</p>
</div>

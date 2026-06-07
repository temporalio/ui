<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';
  import { twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';

  import type { ScheduleFormData } from '../schema/schema';
  import { getSpecSummary } from '../utilities/spec';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
    class?: string;
  }

  let { form, index, class: className }: Props = $props();

  const spec = $derived($form.specs[index]);

  const preview = $derived.by(() => {
    if (spec.type === 'cron' && !spec.cronString) {
      return translate('schedules.spec-preview-example', {
        summary: getSpecSummary(spec),
      });
    }

    if (spec.type === 'interval' && !spec.interval) {
      return translate('schedules.spec-preview-interval-empty');
    }

    return getSpecSummary(spec);
  });
</script>

<div class={twMerge('border border-subtle p-8', className)}>
  <p class="font-mono text-xs">{preview}.</p>
</div>

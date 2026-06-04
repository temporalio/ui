<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';
  import { twMerge } from 'tailwind-merge';

  import { timestamp } from '$lib/components/timestamp.svelte';

  import type { ScheduleFormData } from './schema';
  import { cronToHumanPreview } from './utilities/cron';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
    class?: string;
  }

  let { form, index, class: className }: Props = $props();

  const spec = $derived($form.specs[index]);

  const preview = $derived.by(() => {
    const textPreview = cronToHumanPreview(spec.cronString || '* * * * *', {
      startDate: $form.startDate ? $timestamp($form.startDate) : undefined,
      timezoneName: $form.timezoneName,
      endDateType: $form.endDateType,
      endDate: $form.endDate ? $timestamp($form.endDate) : undefined,
      endAfterOccurrences: $form.endAfterOccurrences,
    });

    if (!spec.cronString) {
      return `Example: ${textPreview}`;
    }

    return textPreview;
  });
</script>

<div class={twMerge('border border-subtle p-8', className)}>
  <p class="font-mono text-xs">{preview}.</p>
</div>

<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import { timestamp } from '$lib/components/timestamp.svelte';

  import { cronToHumanPreview } from './cronstring-to-human-preview';
  import type { ScheduleFormData } from './schema';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
  }

  let { form, index }: Props = $props();

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

<div class="border border-subtle p-8">
  <p class="font-mono text-sm">{preview}.</p>
</div>

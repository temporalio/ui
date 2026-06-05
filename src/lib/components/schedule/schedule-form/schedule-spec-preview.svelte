<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';
  import { twMerge } from 'tailwind-merge';

  import { timestamp } from '$lib/components/timestamp.svelte';

  import type { ScheduleFormData } from './schema';
  import { cronToHumanPreview } from './utilities/cron';
  import { getSpecSummary } from './utilities/spec';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    index: number;
    class?: string;
  }

  let { form, index, class: className }: Props = $props();

  const spec = $derived($form.specs[index]);

  const preview = $derived.by(() => {
    if (spec.type === 'cron' && !spec.cronString) {
      return `Example: ${getSpecSummary(spec)}`;
    }

    if (spec.type === 'interval' && !spec.interval) {
      return 'Set an interval for a summary';
    }

    return getSpecSummary(spec);
  });
</script>

<div class={twMerge('border border-subtle p-8', className)}>
  <p class="font-mono text-xs">{preview}.</p>
</div>

<script lang="ts">
  import Card from '$lib/holocene/card.svelte';

  import type { ScheduleFormData } from './schema';

  interface Props {
    formData: ScheduleFormData;
  }

  let { formData }: Props = $props();

  const endDateDisplay = $derived.by(() => {
    if (formData.endDateType === 'on' && formData.endDate) {
      return formData.endDate;
    }
    if (formData.endDateType === 'after' && formData.endAfterOccurrences) {
      return `After ${formData.endAfterOccurrences} occurrences`;
    }
    return 'No end date';
  });

  const specsSummary = $derived.by(() => {
    const count = formData.specs.length;
    const types = formData.specs.map((s) => s.type).join(', ');
    return `${count} spec${count !== 1 ? 's' : ''} (${types})`;
  });
</script>

<Card class="w-full">
  <h2 class="text-lg font-semibold">Schedule Summary</h2>
  <dl class="mt-4 flex flex-col gap-3">
    <div>
      <dt class="text-xs text-secondary">Schedule Name</dt>
      <dd class="text-sm">{formData.name || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Start date</dt>
      <dd class="text-sm">{formData.startDate || 'Today'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">End date</dt>
      <dd class="text-sm">{endDateDisplay}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Assigned Workflow Type</dt>
      <dd class="text-sm">{formData.workflowType || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Task Queue</dt>
      <dd class="text-sm">{formData.taskQueue || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Description</dt>
      <dd class="text-sm">{specsSummary}</dd>
    </div>
  </dl>
</Card>

<script lang="ts">
  import type { Readable } from 'svelte/store';

  import { _toLowerCase } from 'zod/v4/core';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { pluralize } from '$lib/utilities/pluralize';

  import type { ScheduleFormData } from './schema';
  import { getSpecSummary } from './utilities/spec';

  interface Props {
    form: Readable<ScheduleFormData>;
  }

  let { form }: Props = $props();

  const endDisplay = $derived.by(() => {
    switch ($form.endDateType) {
      case 'never': {
        return 'Never';
      }

      case 'on': {
        if ($form.endDate) {
          return $timestamp($form.endDate);
        }
        break;
      }

      case 'after': {
        if ($form.endAfterOccurrences) {
          return `After ${$form.endAfterOccurrences} ${pluralize('occurrence', $form.endAfterOccurrences)}`;
        }
        break;
      }
    }

    return '--';
  });
</script>

<Card class="w-full">
  <h2 class="text-lg font-semibold">Schedule Summary</h2>
  <dl class="mt-4 flex flex-col gap-3">
    <div>
      <dt class="text-xs text-secondary">Schedule Name</dt>
      <dd class="text-sm">{$form.name || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Start date</dt>
      <dd class="text-sm">
        {$form.startDate ? $timestamp($form.startDate) : '--'}
      </dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">End</dt>
      <dd class="text-sm">{endDisplay}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Assigned Workflow Type</dt>
      <dd class="text-sm">{$form.workflowType || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Task Queue</dt>
      <dd class="text-sm">{$form.taskQueue || '--'}</dd>
    </div>
    <div>
      <dt class="text-xs text-secondary">Description</dt>
      <dd class="flex flex-col text-sm">
        {$form.specs
          .map((spec, i) => {
            const summary = getSpecSummary(spec, $timestamp);
            if (i === 0) {
              return summary;
            }

            return summary.toLowerCase();
          })
          .join(' AND ')}
      </dd>
    </div>
  </dl>
</Card>

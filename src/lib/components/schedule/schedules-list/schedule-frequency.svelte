<script lang="ts">
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';

  import { summarizeScheduleSpec } from '../utilities/summarize';

  import type { ScheduleSpec } from '$types';

  interface Props {
    class?: ClassNameValue;
    spec: ScheduleSpec;
  }

  let { spec, class: className = '' }: Props = $props();

  const timezoneName = $derived(spec?.timezoneName ?? 'UTC');
</script>

<div class={twMerge('flex flex-col', className)}>
  <div class="flex flex-col gap-2">
    <ul>
      {#each summarizeScheduleSpec(spec) as summary (summary)}
        <li>{summary}</li>
      {:else}
        <li>{translate('common.none')}</li>
      {/each}
    </ul>
  </div>
  <p class="text-secondary">
    {translate('common.timezone', { timezone: timezoneName })}
  </p>
</div>

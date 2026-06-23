<script lang="ts">
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import { getScheduleSpecLabel } from '$lib/utilities/schedule-spec-label';

  import type { ScheduleSpec } from '$types';

  interface Props {
    class?: ClassNameValue;
    spec: ScheduleSpec;
  }

  let { spec, class: className = '' }: Props = $props();

  const timezoneName = $derived(spec?.timezoneName ?? 'UTC');
  const cronString = $derived(
    spec?.structuredCalendar?.length > 0 &&
      !!spec?.structuredCalendar[0].comment
      ? spec?.structuredCalendar[0].comment
      : '',
  );
</script>

<div class={twMerge('flex flex-col', className)}>
  <div class="flex flex-col gap-2">
    {#if cronString}
      <p>{cronString}</p>
    {:else}
      <p>{getScheduleSpecLabel(spec, timezoneName)}</p>
    {/if}
  </div>
  <p class="text-secondary">
    {@html translate('common.timezone', { timezone: timezoneName })}
  </p>
</div>

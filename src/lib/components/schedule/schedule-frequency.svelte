<script lang="ts">
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { StructuredCalendar } from '$lib/types/schedule';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import type { IntervalSpec } from '$types';

  interface Props {
    class?: ClassNameValue;
    frequency: (StructuredCalendar | IntervalSpec)[];
    timezoneName?: string;
    inline?: boolean;
  }

  let {
    class: className = '',
    frequency,
    timezoneName = 'UTC',
    inline = false,
  }: Props = $props();
</script>

{#key frequency}
  <div class={twMerge('flex flex-col', className)}>
    <p>{@html translate('common.timezone', { timezone: timezoneName })}</p>
    <div class="flex flex-col gap-2">
      <CodeBlock
        copyable
        {inline}
        testId="schedule-calendar"
        language="json"
        content={stringifyWithBigInt(frequency, null, 2)}
        {...frequency.length > 1 ? { maxHeight: 300 } : {}}
      />
    </div>
  </div>
{/key}

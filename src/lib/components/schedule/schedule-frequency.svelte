<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { StructuredCalendar } from '$lib/types/schedule';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import type { IntervalSpec } from '$types';

  export let calendar: StructuredCalendar | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;
  export let timezoneName = 'UTC';

  export let inline = false;
</script>

{#key [calendar, interval]}
  <div class="flex flex-col {$$props.class}">
    <p>{@html translate('common.timezone', { timezone: timezoneName })}</p>
    <CodeBlock
      copyable
      {inline}
      testId="schedule-calendar"
      language="json"
      content={stringifyWithBigInt(calendar || interval)}
    />
  </div>
{/key}

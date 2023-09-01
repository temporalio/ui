<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { StructuredCalendar } from '$lib/types/schedule';

  import type { IntervalSpec } from '$types';

  export let calendar: StructuredCalendar | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;
  export let inline = false;
</script>

<div class="flex flex-col {$$props.class}">
  <CodeBlock
    copyable
    {inline}
    testId="schedule-calendar"
    language="json"
    content={JSON.stringify(calendar || interval, null, 2)}
  />
</div>

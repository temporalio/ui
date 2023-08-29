<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { StructuredCalendar } from '$lib/types/schedule';
  import { intervalToComment } from '$lib/utilities/schedule-comment-formatting';
  import { commentOrCalendarToFrequency } from '$lib/utilities/schedule-frequency-formatting';

  import type { IntervalSpec } from '$types';

  export let calendar: StructuredCalendar | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;

  const intervalSecs = interval?.interval as string;
  const phaseSecs = interval?.phase as string;
</script>

<div class="flex flex-col {$$props.class}">
  <!-- {#if calendar} -->
  <CodeBlock
    copyable
    inline
    testId="schedule-calendar"
    class="mb-2"
    language="json"
    content={JSON.stringify(calendar || interval, null, 2)}
  />
  <!-- {:else}
    <p data-testid="schedule-interval-frequency">
      {intervalToComment(intervalSecs)}
    </p>
    <p data-testid="schedule-phase-frequency">
      {intervalToComment(phaseSecs, true)}
    </p>
  {/if} -->
</div>

<script lang="ts">
  import { intervalToComment } from '$lib/utilities/schedule-comment-formatting';
  import type { IntervalSpec } from '$types';
  import type { StructuredCalendar } from '$lib/types/schedule';
  import { commentOrCalendarToFrequency } from '$lib/utilities/schedule-frequency-formatting';

  export let calendar: StructuredCalendar | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;

  const intervalSecs = interval?.interval as string;
  const phaseSecs = interval?.phase as string;
</script>

<div class="flex flex-col {$$props.class}">
  {#if calendar}
    <p data-testid="schedule-calendar-frequency">
      {commentOrCalendarToFrequency(calendar)}
    </p>
  {:else}
    <p data-testid="schedule-interval-frequency">
      {intervalToComment(intervalSecs)}
    </p>
    <p data-testid="schedule-phase-frequency">
      {intervalToComment(phaseSecs, true)}
    </p>
  {/if}
</div>

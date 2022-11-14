<script lang="ts">
  import { intervalToComment } from '$lib/utilities/schedule-comment-formatting';
  import type { CalendarSpec, IntervalSpec } from '$types';

  export let calendar: FullCalendarSpec | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;

  const intervalSecs = interval?.interval as string;
  const phaseSecs = interval?.phase as string;
</script>

<div class="flex flex-col {$$props.class}">
  {#if calendar}
    <p>{calendar?.comment ?? ''} UTC</p>
  {:else}
    <p>{intervalToComment(intervalSecs)}</p>
    <p>{intervalToComment(phaseSecs, true)}</p>
  {/if}
</div>

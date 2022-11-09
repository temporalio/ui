<script lang="ts">
  import { intervalToComment } from '$lib/utilities/schedule-comment-formatting';
  import type { CalendarSpec, IntervalSpec } from '$types';

  export let calendar: CalendarSpec | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;
</script>

<div class="flex flex-col {$$props.class}">
  {#if calendar}
    <p>{calendar?.comment ?? ''} UTC</p>
  {:else}
    <p>{intervalToComment(interval?.interval)}</p>
    <p>{intervalToComment(interval?.phase, true)}</p>
  {/if}
</div>

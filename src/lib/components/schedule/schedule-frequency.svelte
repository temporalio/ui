<script lang="ts">
  import { intervalToComment } from '$lib/utilities/schedule-comment-formatting';
  import type { CalendarSpec, IntervalSpec } from '$types';

  export let calendar: CalendarSpec;
  export let interval: IntervalSpec;
</script>

<div class="flex flex-col {$$props.class}">
  {#if calendar}
    <p>{calendar?.comment ?? ''}</p>
  {:else}
    <p>{intervalToComment(interval?.interval)}</p>
    <p>{intervalToComment(interval?.phase, true)}</p>
  {/if}
</div>

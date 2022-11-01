<script lang="ts">
  import { intervalToComment } from '$lib/utilities/schedule-comment-formatting';
  import type { CalendarSpec, IntervalSpec } from '$types';

  export let calendar: CalendarSpec;
  export let interval: IntervalSpec;
</script>

{#if calendar}
  <small>{calendar?.comment ?? ''}</small>
{:else}
  <div class="flex flex-col">
    <small>{intervalToComment(interval?.interval)}</small>
    <small>{intervalToComment(interval?.phase, true)}</small>
  </div>
{/if}

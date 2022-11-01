<script lang="ts">
  import { intervalToComment } from '$lib/utilities/schedule-comment-formatting';
  import type { CalendarSpec, IntervalSpec } from '$types';

  export let calendar: CalendarSpec;
  export let interval: IntervalSpec;
</script>

{#if calendar}
  <small>{calendar?.comment ?? ''}</small>
{:else}
  <small>{intervalToComment(interval)}</small>
{/if}

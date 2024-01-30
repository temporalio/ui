<script lang="ts">
  import type { StructuredCalendar } from '$lib/types/schedule';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import type { IntervalSpec } from '$types';

  export let calendar: StructuredCalendar | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;
</script>

{#key [calendar, interval]}
  <div class="frequency {$$props.class}">
    <code><pre>{stringifyWithBigInt(calendar || interval)}</pre></code>
  </div>
{/key}

<style lang="postcss">
  .frequency {
    @apply flex flex-col overflow-auto rounded-lg bg-slate-900 px-2 py-2 font-mono text-sm text-[#e9d5ff];
  }
</style>

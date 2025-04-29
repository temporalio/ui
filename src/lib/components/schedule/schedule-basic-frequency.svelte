<script lang="ts">
  import type { StructuredCalendar } from '$lib/types/schedule';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import type { IntervalSpec } from '$types';

  export let calendar: StructuredCalendar | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;
</script>

{#key [calendar, interval]}
  <div class="frequency {$$props.class}">
    <code
      ><pre>{stringifyWithBigInt(
          calendar || interval,
          undefined,
          2,
        )}</pre></code
    >
  </div>
{/key}

<style lang="postcss">
  @reference "tailwindcss";

  .frequency {
    @apply border-subtle bg-primary flex h-auto max-h-32 flex-col overflow-auto border px-2 py-2 font-mono text-sm;
  }
</style>

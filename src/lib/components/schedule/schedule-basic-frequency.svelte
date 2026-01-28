<script lang="ts">
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import type { StructuredCalendar } from '$lib/types/schedule';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import type { IntervalSpec } from '$types';

  interface Props {
    class?: ClassNameValue;
    frequency: (StructuredCalendar | IntervalSpec)[];
  }

  let { class: className = '', frequency }: Props = $props();
</script>

{#key frequency}
  <div
    class={twMerge(
      'flex h-auto max-h-32 flex-col overflow-auto border border-subtle bg-primary px-2 py-2 font-mono text-sm',
      className,
    )}
  >
    {#each frequency as content, index (index)}
      <code><pre>{stringifyWithBigInt(content, undefined, 2)}</pre></code>
    {/each}
  </div>
{/key}

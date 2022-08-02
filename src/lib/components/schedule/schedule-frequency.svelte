<script lang="ts">
  import type { CalendarSpec, IntervalSpec } from '$types';
  import CodeBlock from '$lib/holocene/code-block.svelte';

  export let calendar: CalendarSpec;
  export let interval: IntervalSpec;
</script>

{#if !calendar}
  <CodeBlock content={interval} />
{:else}
  <div class="flex flex-row gap-4 break-all text-sm">
    <CodeBlock content={calendar} />
  </div>
{/if}

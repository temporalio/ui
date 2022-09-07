<script>import CodeBlock from '../../holocene/code-block.svelte';
export let calendar;
export let interval;
</script>

{#if !calendar}
  <CodeBlock content={interval} />
{:else}
  <div class="flex flex-row gap-4 break-all text-sm">
    <CodeBlock content={calendar} />
  </div>
{/if}

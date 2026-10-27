<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';

  let {
    code,
    filename = 'Example.svelte',
    collapsible = false,
  }: {
    code: string;
    filename?: string;
    collapsible?: boolean;
  } = $props();
  let expanded = $state(false);
</script>

{#snippet panel()}
  <CodeBlock
    content={code}
    language="text"
    label={filename}
    tabs={[filename]}
    activeTab={filename}
    copyIconTitle="Copy code"
    copySuccessIconTitle="Code copied"
    maxHeight={480}
  />
{/snippet}

{#if collapsible}
  <details
    bind:open={expanded}
    class="mt-3 overflow-hidden rounded-lg border border-primary"
  >
    <summary class="cursor-pointer px-5 py-3 text-xs font-medium"
      >View example source</summary
    >
    {#if expanded}
      <div class="border-t border-primary">{@render panel()}</div>
    {/if}
  </details>
{:else}
  {@render panel()}
{/if}

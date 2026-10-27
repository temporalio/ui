<script lang="ts">
  import type { MarkdownSection } from '../data/markdown';

  import PropsTable from './props-table.svelte';
  import SourceCode from './source-code.svelte';

  let { section }: { section: MarkdownSection } = $props();
</script>

<div
  class="space-y-4 text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-medium [&_li]:ml-5 [&_ol]:list-decimal [&_p]:text-secondary [&_p_code]:rounded [&_p_code]:bg-surface-secondary [&_p_code]:px-1 [&_p_code]:text-xs [&_ul]:list-disc"
>
  {#each section.blocks as block, index (index)}
    {#if block.type === 'props'}
      <PropsTable componentName={block.componentName} rows={block.rows} />
    {:else if block.type === 'code'}
      <SourceCode code={block.code} filename={block.filename} />
    {:else}
      <!-- HTML is produced from Markdown with hast-util-sanitize in data/markdown.ts. -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html block.html}
    {/if}
  {/each}
</div>

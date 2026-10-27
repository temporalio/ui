<script lang="ts">
  import type { Snippet } from 'svelte';

  import { getComponentContent } from '../data/components';

  import AnatomyFigure from './anatomy-figure.svelte';
  import DocSection from './doc-section.svelte';
  import MarkdownContent from './markdown-content.svelte';

  let { slug, preview }: { slug: string; preview?: Snippet } = $props();

  const section = $derived(getComponentContent(slug).sections.anatomy);
  const anatomy = $derived(
    section?.blocks.find((block) => block.type === 'anatomy'),
  );
  const intro = $derived(
    section && {
      ...section,
      blocks: section.blocks.filter((block) => block.type !== 'anatomy'),
    },
  );
</script>

{#if section}
  <DocSection id="anatomy" title={section.title}>
    {#if preview && anatomy?.type === 'anatomy' && intro}
      <div class="space-y-5">
        <MarkdownContent section={intro} />
        <AnatomyFigure parts={anatomy.parts} {preview} />
      </div>
    {:else}
      <MarkdownContent {section} />
    {/if}
  </DocSection>
{/if}

<script lang="ts">
  import type { Snippet } from 'svelte';

  import DocSection from './doc-section.svelte';
  import SourceCode from './source-code.svelte';

  let {
    source,
    filename,
    preview,
    controls,
  }: {
    source: string;
    filename: string;
    preview: Snippet;
    controls: Snippet;
  } = $props();
</script>

<DocSection id="playground" title="Playground" class="mt-0">
  <div class="overflow-hidden rounded-lg border border-primary">
    <div class="grid md:grid-cols-[minmax(0,1fr)_260px]">
      <div
        class="flex min-h-64 min-w-0 flex-col items-center justify-center gap-6 bg-surface-secondary p-8"
      >
        {@render preview()}
      </div>
      <div
        class="flex flex-col gap-4 border-t border-primary bg-background-primary p-5 md:border-l md:border-t-0"
      >
        {@render controls()}
      </div>
    </div>
  </div>
  <div class="mt-4">
    <SourceCode code={source} {filename} />
  </div>
</DocSection>

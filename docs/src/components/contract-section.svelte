<script lang="ts">
  import { Badge } from '$lib/io/badge';

  import { getContract, maintainerSections } from '../data/contracts';
  import type { MarkdownSection } from '../data/markdown';

  import DocSection from './doc-section.svelte';
  import MarkdownContent from './markdown-content.svelte';

  let { slug }: { slug: string } = $props();

  const contract = $derived(getContract(slug));
  const rules = $derived(
    contract?.sections.filter(
      (section) => !maintainerSections.includes(section.id),
    ) ?? [],
  );
  const notes = $derived(
    contract?.sections.filter((section) =>
      maintainerSections.includes(section.id),
    ) ?? [],
  );

  const countRules = (section: MarkdownSection | undefined, prefix: string) =>
    section?.blocks.reduce(
      (total, block) =>
        total +
        (block.type === 'html'
          ? (block.html.match(new RegExp(`<strong>${prefix}-\\d+`, 'g'))
              ?.length ?? 0)
          : 0),
      0,
    ) ?? 0;

  const gapCount = $derived(
    countRules(
      notes.find((section) => section.id === 'known-gaps'),
      'GAP',
    ),
  );
  const decisionCount = $derived(
    countRules(
      notes.find((section) => section.id === 'decisions'),
      'DEC',
    ),
  );
</script>

{#if contract}
  <DocSection id="contract" title="Contract">
    <div class="space-y-6">
      <div
        class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-secondary"
      >
        <Badge
          text={contract.meta.status}
          colorScheme={contract.meta.status === 'approved'
            ? 'success'
            : 'warning'}
          size="sm"
        />
        {#if contract.meta.lastReviewed}
          <span>Last reviewed {contract.meta.lastReviewed}</span>
        {/if}
        <span
          >Source <code
            class="rounded bg-surface-secondary px-1 font-mono text-primary"
            >{contract.path}</code
          ></span
        >
      </div>
      <MarkdownContent section={contract.intro} />
      {#each rules as section (section.id)}
        <div>
          <h3 class="mb-3 text-base font-medium">{section.title}</h3>
          <MarkdownContent {section} />
        </div>
      {/each}
      {#if notes.length}
        <details
          class="group rounded-lg border border-primary bg-surface-secondary"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary [&::-webkit-details-marker]:hidden"
          >
            <span>Maintainer notes</span>
            <span class="flex items-center gap-3 text-xs text-secondary">
              <span
                >{gapCount} known {gapCount === 1 ? 'gap' : 'gaps'} · {decisionCount}
                {decisionCount === 1 ? 'decision' : 'decisions'}</span
              >
              <span
                class="transition-transform group-open:rotate-180"
                aria-hidden="true">▾</span
              >
            </span>
          </summary>
          <div class="space-y-6 border-t border-primary px-4 py-5">
            {#each notes as section (section.id)}
              <div>
                <h3 class="mb-3 text-base font-medium">{section.title}</h3>
                <MarkdownContent {section} />
              </div>
            {/each}
          </div>
        </details>
      {/if}
    </div>
  </DocSection>
{/if}

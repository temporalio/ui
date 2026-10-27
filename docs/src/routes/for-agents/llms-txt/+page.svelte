<script lang="ts">
  import { page } from '$app/state';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import DocSection from '$docs/components/doc-section.svelte';
  import FoundationPage from '$docs/components/foundation-page.svelte';
  import SourceCode from '$docs/components/source-code.svelte';
  import { llmsPaths } from '$docs/data/llms';

  const sections = [
    { id: 'files', label: 'Files' },
    { id: 'usage', label: 'Usage' },
  ];

  const url = (path: string) => `${page.url.origin}${path}`;

  const files = [
    {
      path: llmsPaths.index,
      description:
        'An index of the usage guide and every component, with links to its docs, contract and examples.',
    },
    {
      path: llmsPaths.full,
      description:
        "The usage guide and every component's docs and contract in one file.",
    },
    {
      path: llmsPaths.guide,
      description:
        'The usage guide: setup, which component to use when, the shared form API, overlays, and common mistakes.',
    },
    {
      path: llmsPaths.component('<slug>'),
      description:
        "A component's docs: anatomy, usage, and the API reference. Also under Copy page on each component.",
    },
    {
      path: llmsPaths.contract('<slug>'),
      description:
        "A component's contract: numbered MUST, SHOULD and MAY rules, known gaps and open decisions.",
    },
    {
      path: llmsPaths.example('<slug>'),
      description: "The Svelte source of a component's examples.",
    },
  ];

  const prompt = $derived(
    `Read ${url(llmsPaths.index)} and follow its usage guide. Use io-poc components from @temporalio/ui for this change.`,
  );
</script>

<FoundationPage
  category="For agents"
  title="LLMs.txt"
  description="Plain-text versions of these docs for AI tools, following the llms.txt convention. Point an assistant at them so it uses io-poc components the way the docs and contracts describe."
  {sections}
>
  <DocSection
    id="files"
    title="Files"
    description="Every file is generated from the same Markdown and contracts as these pages, so it stays current with them."
    class="mt-0"
  >
    <Table
      class="text-left text-xs leading-relaxed [&_td]:!whitespace-normal [&_td]:!px-4 [&_td]:py-3 [&_td]:align-top [&_th]:!px-4"
    >
      {#snippet caption()}<caption class="sr-only">LLMs.txt files</caption
        >{/snippet}
      {#snippet headers()}
        <TableHeaderRow>
          <th scope="col">File</th>
          <th scope="col">Contents</th>
        </TableHeaderRow>
      {/snippet}
      {#each files as file (file.path)}
        <TableRow>
          <td class="font-mono">
            {#if file.path.includes('<slug>')}
              {file.path}
            {:else}
              <a
                href={file.path}
                target="_blank"
                class="underline underline-offset-4">{file.path}</a
              >
            {/if}
          </td>
          <td class="text-secondary">{file.description}</td>
        </TableRow>
      {/each}
    </Table>
  </DocSection>

  <DocSection
    id="usage"
    title="Usage"
    description="Any tool that reads llms.txt can use these files. Start from the index, which links to everything else."
  >
    <ul class="mb-5 list-disc space-y-2 pl-5 text-sm leading-relaxed">
      <li>
        <span class="font-medium">Cursor:</span> add {url(llmsPaths.index)} under
        Docs, then reference it with <code>@Docs</code>.
      </li>
      <li>
        <span class="font-medium">Claude Code and other assistants:</span>
        include the link in a prompt or in your project's
        <code>AGENTS.md</code>.
      </li>
      <li>
        <span class="font-medium">Large context windows:</span> attach
        <code>{llmsPaths.full}</code> to give the whole system at once.
      </li>
    </ul>
    <SourceCode code={prompt} filename="Prompt" />
  </DocSection>
</FoundationPage>

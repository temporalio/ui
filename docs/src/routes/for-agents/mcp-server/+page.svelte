<script lang="ts">
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import DocSection from '$docs/components/doc-section.svelte';
  import FoundationPage from '$docs/components/foundation-page.svelte';
  import SourceCode from '$docs/components/source-code.svelte';

  const sections = [
    { id: 'setup', label: 'Setup' },
    { id: 'tools', label: 'Tools' },
  ];

  const server = { command: 'node', args: ['docs/mcp/server.mjs'] };
  const json = (value: unknown) => JSON.stringify(value, null, 2);

  const clients = [
    {
      name: 'Claude Code',
      note: 'The repository’s .mcp.json already registers the server. Approve io-poc when Claude Code asks, or add it yourself from the repository root:',
      filename: 'Terminal',
      code: 'claude mcp add io-poc -- node docs/mcp/server.mjs',
    },
    {
      name: 'VS Code',
      note: 'Add this to .vscode/mcp.json, then choose Start in that file.',
      filename: '.vscode/mcp.json',
      code: json({ servers: { 'io-poc': server } }),
    },
    {
      name: 'Cursor',
      note: 'Add this to .cursor/mcp.json, then turn the server on under Cursor Settings › MCP.',
      filename: '.cursor/mcp.json',
      code: json({ mcpServers: { 'io-poc': server } }),
    },
  ];

  const tools = [
    [
      'list_components',
      '—',
      'Every component with its slug, name, description, package entry point and whether it has a contract.',
    ],
    [
      'get_usage_guide',
      '—',
      'Setup, which component to use when, the shared form API, overlays and common mistakes.',
    ],
    [
      'get_component_docs',
      'slug',
      'Anatomy, usage snippets and the API reference with every prop.',
    ],
    [
      'get_contract',
      'slug',
      'Numbered MUST, SHOULD and MAY rules, known gaps and open decisions.',
    ],
    ['get_example', 'slug', 'The Svelte source of the component’s examples.'],
  ];
</script>

<FoundationPage
  category="For agents"
  title="MCP server"
  description="The io-poc MCP server lets AI assistants look up components, their docs, contracts and examples while they write code. It runs locally over stdio from a temporalio/ui checkout and reads the same files as these pages."
  {sections}
>
  <DocSection
    id="setup"
    title="Setup"
    description="Run commands from the root of a temporalio/ui checkout after pnpm install. Paths in the configuration are relative to that root."
    class="mt-0"
  >
    <div class="space-y-8">
      {#each clients as client (client.name)}
        <div>
          <h3 class="mb-2 text-base font-medium">{client.name}</h3>
          <p class="mb-3 text-sm text-secondary">{client.note}</p>
          <SourceCode code={client.code} filename={client.filename} />
        </div>
      {/each}
    </div>
  </DocSection>

  <DocSection
    id="tools"
    title="Tools"
    description="Each slug input accepts only documented components, so assistants call list_components first."
  >
    <Table
      class="text-left text-xs leading-relaxed [&_td]:!whitespace-normal [&_td]:!px-4 [&_td]:py-3 [&_td]:align-top [&_th]:!px-4"
    >
      {#snippet caption()}<caption class="sr-only">MCP server tools</caption
        >{/snippet}
      {#snippet headers()}
        <TableHeaderRow>
          {#each ['Tool', 'Input', 'Returns'] as heading (heading)}<th
              scope="col">{heading}</th
            >{/each}
        </TableHeaderRow>
      {/snippet}
      {#each tools as row (row[0])}
        <TableRow>
          {#each row as cell, index (index)}<td
              class:font-mono={index < 2}
              class:text-secondary={index > 0}>{cell}</td
            >{/each}
        </TableRow>
      {/each}
    </Table>
  </DocSection>
</FoundationPage>

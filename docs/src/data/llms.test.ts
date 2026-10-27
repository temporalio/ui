import { describe, expect, it } from 'vitest';

import { buildLlmsFull, buildLlmsIndex, type LlmsInput } from './llms';

const input: LlmsInput = {
  origin: 'https://io.example',
  guide: '# Using io-poc components\n\nGuide body.\n',
  components: [
    {
      slug: 'select',
      name: 'Select',
      description: 'Choose options from a list.',
      markdown: '# Select\n\nChoose options from a list.\n',
      contract:
        '---\ncomponent: Select\n---\n\n# Select contract\n\n- **IN-1** Rule.\n',
      hasExample: true,
    },
    {
      slug: 'toggle',
      name: 'Toggle',
      description: 'A pressed button.',
      markdown: '# Toggle\n\nA pressed button.\n',
      hasExample: false,
    },
  ],
};

describe('llms.txt', () => {
  it('follows the llms.txt layout with absolute links', () => {
    const index = buildLlmsIndex(input);
    expect(index).toMatch(/^# io Design System\n\n> /);
    expect(index).toContain(
      '- [Using io-poc components](https://io.example/agents.md):',
    );
    expect(index).toContain(
      '- [Select](https://io.example/components/select.md): Choose options from a list. (contract: https://io.example/contracts/select.md; examples: https://io.example/examples/select.svelte)',
    );
    expect(index).toContain(
      '- [Toggle](https://io.example/components/toggle.md): A pressed button.\n',
    );
  });

  it('links the For agents pages, including the MCP server, before the components', () => {
    const index = buildLlmsIndex(input);
    const section = index.slice(
      index.indexOf('## For agents'),
      index.indexOf('## Components'),
    );
    expect(section).toContain(
      '- [LLMs.txt](https://io.example/for-agents/llms-txt):',
    );
    expect(section).toContain(
      '- [MCP server](https://io.example/for-agents/mcp-server):',
    );
    expect(section).toContain('`node docs/mcp/server.mjs`');
    expect(index.indexOf('## For agents')).toBeGreaterThan(
      index.indexOf('## Guides'),
    );
  });

  it('uses root-relative links without an origin', () => {
    expect(buildLlmsIndex({ ...input, origin: '' })).toContain(
      '- [Select](/components/select.md)',
    );
  });

  it('joins the guide, docs and contracts without frontmatter', () => {
    const full = buildLlmsFull(input);
    expect(full).toContain('Guide body.');
    expect(full).toContain(
      '# Select\n\nChoose options from a list.\n\n# Select contract',
    );
    expect(full).not.toContain('component: Select');
    expect(full.split('\n---\n')).toHaveLength(4);
  });
});

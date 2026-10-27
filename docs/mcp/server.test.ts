// @vitest-environment node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { components, createServer } from './server.mjs';

const client = new Client({ name: 'test', version: '1.0.0' });

const callText = async (name: string, args?: Record<string, unknown>) => {
  const result = await client.callTool({ name, arguments: args });
  const [content] = result.content as { type: string; text: string }[];
  return { text: content.text, isError: !!result.isError };
};

describe('io-poc MCP server', () => {
  beforeAll(async () => {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await createServer().connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(() => client.close());

  it('lists its tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_component_docs',
      'get_contract',
      'get_example',
      'get_usage_guide',
      'list_components',
    ]);
  });

  it('lists every documented component with its entry point', async () => {
    const list = JSON.parse((await callText('list_components')).text);
    expect(list).toHaveLength(35);
    expect(list).toEqual(components);
    expect(list).toContainEqual({
      slug: 'progress-circular',
      name: 'Progress Circular',
      description: expect.any(String),
      entryPoint: '@temporalio/ui/io-poc/progress',
      hasContract: true,
    });
    expect(
      list.every((item: { hasContract: boolean }) => item.hasContract),
    ).toBe(true);
  });

  it('returns docs, contract, example and guide text', async () => {
    expect(
      (await callText('get_component_docs', { slug: 'select' })).text,
    ).toMatch(/^# Select\n/);
    expect((await callText('get_contract', { slug: 'select' })).text).toContain(
      '**IN-1**',
    );
    expect((await callText('get_example', { slug: 'select' })).text).toContain(
      "from '$lib/io-poc/select'",
    );
    expect((await callText('get_usage_guide')).text).toMatch(
      /^# Using io-poc components/,
    );
  });

  it('rejects unknown slugs', async () => {
    const result = await callText('get_contract', { slug: 'carousel' });
    expect(result.isError).toBe(true);
  });
});

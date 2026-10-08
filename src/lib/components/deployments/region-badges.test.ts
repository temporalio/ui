// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';
import type { ComputeConfig } from '$lib/types/deployments';

let regionBadges: Component<Record<string, unknown>>;
let renderComponent: typeof render;
let closeViteServer: (() => Promise<void>) | undefined;

beforeAll(async () => {
  const projectRoot = process.cwd();
  const lifecycle = await startIsolatedViteServer(
    createServer,
    {
      root: projectRoot,
      configFile: false,
      appType: 'custom',
      plugins: [svelte({ hot: false })],
      resolve: {
        alias: [
          { find: '$lib', replacement: path.resolve(projectRoot, 'src/lib') },
          {
            find: '$types',
            replacement: path.resolve(projectRoot, 'src/types'),
          },
          {
            find: '$app',
            replacement: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
          },
        ],
      },
      server: { middlewareMode: true },
    },
    async (server) => ({
      regionBadges: (
        await server.ssrLoadModule(
          '/src/lib/components/deployments/region-badges.svelte',
        )
      ).default,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ regionBadges, renderComponent } = lifecycle.value);
});

afterAll(async () => {
  await closeViteServer?.();
});

const EAST = 'aws-us-east-1';
const WEST = 'aws-us-west-2';

const config = (groups: Record<string, unknown>): ComputeConfig =>
  ({ scalingGroups: groups }) as ComputeConfig;

const lambda = { providerType: 'aws-lambda' };

const renderBadges = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions?: { regionId: string; active?: boolean }[],
): string =>
  renderComponent(regionBadges, {
    props: { computeConfig, namespaceRegions },
  }).body;

const matches = (body: string) =>
  [...body.matchAll(/data-region-match="([a-z-]+)"/g)].map((m) => m[1]);

describe('region-badges', () => {
  it('renders nothing without regions', () => {
    expect(matches(renderBadges(config({ any: lambda })))).toEqual([]);
  });

  it('renders nothing for a single-region Namespace', () => {
    const body = renderBadges(config({ any: lambda }), [
      { regionId: EAST, active: true },
    ]);

    expect(matches(body)).toEqual([]);
  });

  it('shows a badge per region, without the cloud prefix', () => {
    const body = renderBadges(config({ any: lambda }), [
      { regionId: EAST, active: true },
      { regionId: WEST },
    ]);

    expect(matches(body)).toEqual(['catch-all', 'catch-all']);
    expect(body).toContain('us-east-1');
    expect(body).toContain('us-west-2');
    expect(body).not.toContain('aws-us-east-1');
  });

  it('colours only the region nothing serves', () => {
    // In a list, colouring every region would make the ordinary case look
    // alarming and the real one easy to miss.
    const body = renderBadges(config({ east: { ...lambda, regionId: EAST } }), [
      { regionId: EAST, active: true },
      { regionId: WEST },
    ]);

    expect(matches(body)).toEqual(['region', 'none']);
    expect(body).toContain('border-danger');
  });

  it('leaves a fully covered row uncoloured', () => {
    const body = renderBadges(
      config({
        east: { ...lambda, regionId: EAST },
        west: { ...lambda, regionId: WEST },
      }),
      [{ regionId: EAST, active: true }, { regionId: WEST }],
    );

    expect(matches(body)).toEqual(['region', 'region']);
    expect(body).not.toContain('border-danger');
  });
});

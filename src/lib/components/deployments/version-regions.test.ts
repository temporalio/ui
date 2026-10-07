// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';
import type { ComputeConfig } from '$lib/types/deployments';

let versionRegions: Component<Record<string, unknown>>;
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
      versionRegions: (
        await server.ssrLoadModule(
          '/src/lib/components/deployments/version-regions.svelte',
        )
      ).default,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ versionRegions, renderComponent } = lifecycle.value);
});

afterAll(async () => {
  await closeViteServer?.();
});

const EAST = 'aws-us-east-1';
const WEST = 'aws-us-west-2';

const lambdaGroup = { providerType: 'aws-lambda' };
const cloudRunGroup = { providerType: 'gcp-cloud-run' };

const config = (groups: Record<string, unknown>): ComputeConfig =>
  ({ scalingGroups: groups }) as ComputeConfig;

const renderRegions = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions?: { regionId: string; active?: boolean }[],
): string =>
  renderComponent(versionRegions, {
    props: { computeConfig, namespaceRegions },
  }).body;

describe('version-regions', () => {
  // The gate. A consumer that knows nothing about regions passes none, and
  // nothing multi-region should reach the page.
  it('renders nothing without regions', () => {
    expect(renderRegions(config({ any: lambdaGroup }))).not.toContain(
      'data-region-role',
    );
  });

  it('renders nothing for a single-region Namespace', () => {
    const body = renderRegions(config({ any: lambdaGroup }), [
      { regionId: EAST, active: true },
    ]);

    expect(body).not.toContain('data-region-role');
  });

  it('renders nothing when a group names a region but the Namespace has one', () => {
    // The compute config gets no vote in the gate.
    const body = renderRegions(
      config({ east: { ...lambdaGroup, regionId: EAST } }),
      [{ regionId: EAST, active: true }],
    );

    expect(body).not.toContain('data-region-role');
  });

  it('marks the active region primary wherever it appears in the list', () => {
    const body = renderRegions(config({ any: lambdaGroup }), [
      { regionId: WEST },
      { regionId: EAST, active: true },
    ]);

    // Asserted on the role attribute rather than the badge wording, so
    // rewording the label does not fail this.
    const roles = [...body.matchAll(/data-region-role="([a-z]+)"/g)].map(
      (m) => m[1],
    );
    expect(roles).toEqual(['replica', 'primary']);
  });

  it('shows the region without its cloud prefix', () => {
    const body = renderRegions(config({ any: lambdaGroup }), [
      { regionId: EAST, active: true },
      { regionId: WEST },
    ]);

    expect(body).toContain('us-east-1');
    expect(body).toContain('us-west-2');
    expect(body).not.toContain('aws-us-east-1');
  });

  it('names the provider serving each region', () => {
    const body = renderRegions(
      config({
        east: { ...lambdaGroup, regionId: EAST },
        west: { ...cloudRunGroup, regionId: WEST },
      }),
      [{ regionId: EAST, active: true }, { regionId: WEST }],
    );

    expect(body).toContain('Lambda');
    expect(body).toContain('Cloud Run');
  });

  it('flags a region nothing serves', () => {
    // The point of the whole display: a failover here finds no workers.
    const body = renderRegions(
      config({ east: { ...lambdaGroup, regionId: EAST } }),
      [{ regionId: EAST, active: true }, { regionId: WEST }],
    );

    const matches = [...body.matchAll(/data-region-match="([a-z-]+)"/g)].map(
      (m) => m[1],
    );
    expect(matches).toEqual(['region', 'none']);
    expect(body).toContain('No compute configured');
  });

  it('says when a region is served by the default group rather than its own', () => {
    // A catch-all covering a region is different from one configured for it,
    // and the difference is what says whether the failover was planned for.
    const body = renderRegions(config({ any: lambdaGroup }), [
      { regionId: EAST, active: true },
      { regionId: WEST },
    ]);

    expect(body).toContain('Default compute');
    expect(body).not.toContain('data-region-match="none"');
  });
});

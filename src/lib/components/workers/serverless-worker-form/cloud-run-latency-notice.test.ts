// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

let cloudRunLatencyNotice: Component<Record<string, unknown>>;
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
          {
            find: '$lib',
            replacement: path.resolve(projectRoot, 'src/lib'),
          },
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
      cloudRunLatencyNotice: (
        await server.ssrLoadModule(
          '/src/lib/components/workers/serverless-worker-form/cloud-run-latency-notice.svelte',
        )
      ).default,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ cloudRunLatencyNotice, renderComponent } = lifecycle.value);
});

afterAll(async () => {
  await closeViteServer?.();
});

const knownIssuesUrl =
  'https://cloud.google.com/run/docs/known-issues#deployment-latency';

const renderNotice = (provider: string | undefined): string =>
  renderComponent(cloudRunLatencyNotice, { props: { provider } }).body;

describe('CloudRunLatencyNotice', () => {
  it('warns about the open Google Cloud issue when Cloud Run is selected', () => {
    const body = renderNotice('cloud-run');

    expect(body).toContain(
      'Open Google Cloud issue: high deployment latency in some regions',
    );
    expect(body).toContain(
      'Google currently reports that creating or updating Cloud Run resources takes longer than expected in some regions, including us-central1.',
    );
    expect(body).toContain(
      'Google recommends deploying to another region while the issue is open.',
    );
    expect(body).toContain('in the Cloud Run known issues.');
  });

  it('links to the Cloud Run known issues in a new tab', () => {
    const body = renderNotice('cloud-run');

    expect(body).toContain(`href="${knownIssuesUrl}"`);
    expect(body).toContain('target="_blank"');
    expect(body).toContain('High deployment latency in some regions');
  });

  it('renders nothing for other compute providers', () => {
    expect(renderNotice('lambda')).not.toContain(knownIssuesUrl);
    expect(renderNotice(undefined)).not.toContain(knownIssuesUrl);
  });
});

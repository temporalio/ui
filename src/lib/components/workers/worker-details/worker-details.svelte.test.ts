// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';
import type { WorkerInfo, WorkerSlotsInfo } from '$lib/types';

let workerDetails: Component<Record<string, unknown>>;
let renderComponent: typeof render;
let createRawSnippet: typeof import('svelte').createRawSnippet;
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
        alias: {
          '$lib/components/lines-and-dots/sdk-logo.svelte': path.resolve(
            projectRoot,
            'src/lib/components/workers/worker-details/worker-details-child-test-double.svelte',
          ),
          '$lib/components/timestamp.svelte': path.resolve(
            projectRoot,
            'src/lib/components/workers/worker-details/worker-details-child-test-double.svelte',
          ),
          $lib: path.resolve(projectRoot, 'src/lib'),
          $types: path.resolve(projectRoot, 'src/types'),
          $app: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
        },
      },
      server: { hmr: false, middlewareMode: true },
    },
    async (server) => ({
      workerDetails: (
        await server.ssrLoadModule(
          '/src/lib/components/workers/worker-details/worker-details.svelte',
        )
      ).default,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
      createRawSnippet: (await server.ssrLoadModule('svelte')).createRawSnippet,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ createRawSnippet, renderComponent, workerDetails } = lifecycle.value);
});

afterAll(async () => closeViteServer?.());

const renderSlots = (slots?: WorkerSlotsInfo): string => {
  const worker: WorkerInfo = {
    workerHeartbeat: slots ? { workflowTaskSlotsInfo: slots } : {},
  };
  const { body } = renderComponent(workerDetails, {
    props: {
      breadcrumb: createRawSnippet(() => ({ render: () => '' })),
      worker,
      onrefresh: () => {},
    },
  });
  return (
    body
      .match(
        /<dt id="slots-[^"]*"[\s\S]*?<\/dt>\s*<dd>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/,
      )?.[1]
      .replaceAll(/<[^>]*>/g, '')
      .replaceAll(/\s/g, '') ?? ''
  );
};

describe('Worker slot display', () => {
  it.each([
    [0, 3, '0/3'],
    [1, 2, '1/3'],
    [2, 1, '2/3'],
    [3, 0, '3/3'],
    [0, 0, '-'],
    [2, -1, '2'],
  ])(
    'renders used=%s and available=%s as %s',
    (currentUsedSlots, currentAvailableSlots, expected) => {
      expect(renderSlots({ currentUsedSlots, currentAvailableSlots })).toBe(
        expected,
      );
    },
  );

  it.each([null, undefined])(
    'uses the protobuf zero default when available slots are %s',
    (currentAvailableSlots) => {
      expect(renderSlots({ currentUsedSlots: 2, currentAvailableSlots })).toBe(
        '2/2',
      );
    },
  );

  it('preserves the empty state when slots are missing', () => {
    expect(renderSlots()).toBe('-');
  });
});

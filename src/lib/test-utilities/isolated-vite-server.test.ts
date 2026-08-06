// @vitest-environment node

import { existsSync } from 'node:fs';
import path from 'node:path';

import type { InlineConfig } from 'vite';
import { describe, expect, it, vi } from 'vitest';

import { startIsolatedViteServer } from './isolated-vite-server';

describe('startIsolatedViteServer', () => {
  it('isolates parallel caches and removes them after close or startup failure', async () => {
    const cacheDirectories: string[] = [];
    const close = vi.fn();
    const createServer = vi.fn(async (config: InlineConfig) => {
      const cacheDirectory = config.cacheDir as string;
      cacheDirectories.push(cacheDirectory);
      return {
        close: async () => {
          expect(existsSync(cacheDirectory)).toBe(true);
          close();
        },
      };
    });

    const [first, second] = await Promise.all([
      startIsolatedViteServer(createServer, {}),
      startIsolatedViteServer(createServer, {}),
    ]);

    expect(cacheDirectories[0]).not.toBe(cacheDirectories[1]);
    expect(cacheDirectories.every(existsSync)).toBe(true);
    expect(
      cacheDirectories.every(
        (cacheDirectory) =>
          !cacheDirectory.startsWith(
            path.resolve(process.cwd(), 'node_modules/.vite'),
          ),
      ),
    ).toBe(true);

    await Promise.all([first.close(), second.close()]);

    expect(close).toHaveBeenCalledTimes(2);
    expect(cacheDirectories.some(existsSync)).toBe(false);

    let failedCacheDirectory = '';
    await expect(
      startIsolatedViteServer(
        async (config) => {
          failedCacheDirectory = config.cacheDir as string;
          return {
            close: async () => {
              expect(existsSync(failedCacheDirectory)).toBe(true);
              close();
            },
          };
        },
        {},
        async () => {
          throw new Error('initialization failed');
        },
      ),
    ).rejects.toThrow('initialization failed');
    expect(existsSync(failedCacheDirectory)).toBe(false);

    let startupCacheDirectory = '';
    await expect(
      startIsolatedViteServer(async (config) => {
        startupCacheDirectory = config.cacheDir as string;
        throw new Error('startup failed');
      }, {}),
    ).rejects.toThrow('startup failed');
    expect(existsSync(startupCacheDirectory)).toBe(false);
  });
});

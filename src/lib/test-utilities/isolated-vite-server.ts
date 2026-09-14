import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { InlineConfig } from 'vite';

interface CloseableViteServer {
  close(): Promise<void>;
}

interface IsolatedViteServer<TServer, TValue> {
  server: TServer;
  value: TValue;
  close(): Promise<void>;
}

type ViteServerFactory<TServer> = (config: InlineConfig) => Promise<TServer>;

export async function startIsolatedViteServer<
  TServer extends CloseableViteServer,
  TValue = TServer,
>(
  createServer: ViteServerFactory<TServer>,
  config: InlineConfig,
  initialize?: (server: TServer) => Promise<TValue>,
): Promise<IsolatedViteServer<TServer, TValue>> {
  const cacheDir = await mkdtemp(
    path.join(os.tmpdir(), 'temporal-ui-vite-cache-'),
  );
  let server: TServer | undefined;

  const removeCache = () => rm(cacheDir, { force: true, recursive: true });

  try {
    server = await createServer({ ...config, cacheDir });
    const activeServer = server;
    const value = initialize
      ? await initialize(activeServer)
      : (activeServer as unknown as TValue);
    let closePromise: Promise<void> | undefined;

    return {
      server: activeServer,
      value,
      close: () => {
        closePromise ??= (async () => {
          try {
            await activeServer.close();
          } finally {
            await removeCache();
          }
        })();
        return closePromise;
      },
    };
  } catch (error) {
    try {
      if (server) await Promise.allSettled([server.close()]);
    } finally {
      await removeCache();
    }
    throw error;
  }
}

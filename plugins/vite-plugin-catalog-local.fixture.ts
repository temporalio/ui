import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { createServer } from 'vite';

import { catalogLocalPlugin } from './vite-plugin-catalog-local';

void (async () => {
  const isHmrPayload = (
    value: unknown,
  ): value is { event?: string; type?: string } =>
    Boolean(value && typeof value === 'object');
  const root = await realpath(await mkdtemp(join(tmpdir(), 'catalog-vite-')));
  const paths = [
    'catalog.local/registration.ts',
    'catalog.local/workflows.ts',
    'catalog.local/catalog.generated.json',
    'src/lib/catalog/worker/examples/index.ts',
    'src/lib/catalog/worker/workflows.ts',
    'src/lib/catalog/browser/catalog.generated.json',
    'src/lib/catalog/browser/catalog.generated.ts',
  ].map((path) => join(root, path));
  const writeOwned = async () => {
    await Promise.all(
      paths.map(async (path) => {
        await mkdir(dirname(path), { recursive: true });
        await writeFile(
          path,
          path.endsWith('.json')
            ? '{"descriptors":[]}'
            : `export const revision = ${Date.now()};\n`,
        );
      }),
    );
    await mkdir(join(root, 'catalog.local/examples/example'), {
      recursive: true,
    });
    await writeFile(
      join(root, 'catalog.local/examples/example/workflow.ts'),
      'export const workflow = true;\n',
    );
    await writeFile(
      join(root, 'catalog.local/examples/example/example.ts'),
      'export const example = true;\n',
    );
  };
  const terminal = {
    kind: 'terminal' as const,
    operationId: 'save',
    outcome: {
      baseRevision: 'saved',
      changedPaths: [],
      commit: 'durable' as const,
      exampleId: 'example',
      generatedOutputs: [],
      status: 'succeeded' as const,
    },
    ownership: 'released' as const,
    reload: 'publish' as const,
    sequence: 2,
  };
  await writeOwned();
  const server = await createServer({
    configFile: false,
    logLevel: 'silent',
    root,
    plugins: [
      catalogLocalPlugin({
        authoring: {
          scaffold: writeOwned,
          loadExamples: async () => [
            {
              id: 'example',
              sourceFiles: [
                {
                  path: 'workflow.ts',
                  content: 'export const workflow = true;\n',
                },
              ],
              sourceId: 'local',
              sourceSnapshot: { baseRevision: 'loaded' },
              targetId: 'local',
            },
          ],
          save: async (
            _request: unknown,
            progress?: (event: unknown) => void,
          ) => {
            progress?.({
              kind: 'check',
              operationId: 'save',
              sequence: 1,
              severity: 'blocking',
              state: 'started',
              step: 'write_files',
            });
            await writeOwned();
            progress?.(terminal);
            return terminal;
          },
        } as never,
        loadDescriptors: async () => [],
      }),
    ],
    server: { host: '127.0.0.1', port: 0 },
  });
  try {
    await server.listen();
    const port = (server.httpServer!.address() as { port: number }).port;
    const sent: unknown[] = [];
    const original = server.ws.send.bind(server.ws);
    server.ws.send = ((payload: unknown) => {
      sent.push(payload);
      original(payload as never);
    }) as never;
    for (const url of [
      '/src/lib/catalog/worker/examples/index.ts',
      '/src/lib/catalog/worker/workflows.ts',
    ])
      await Promise.all([
        server.environments.client.transformRequest(url),
        server.environments.ssr.transformRequest(url),
      ]);
    const post = async (path: string, body: unknown) =>
      fetch(`http://127.0.0.1:${port}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
    const scaffold = await post('/__catalog-local-authoring/scaffold', {
      exampleId: 'example',
    });
    if (scaffold.status !== 204) throw new Error(`scaffold ${scaffold.status}`);
    await scaffold.text();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const hmr = () =>
      sent.filter(
        (value) =>
          isHmrPayload(value) &&
          (value.type === 'update' || value.type === 'full-reload'),
      );
    const refresh = () =>
      sent.filter(
        (value) =>
          isHmrPayload(value) && value.event === 'catalog-local:refresh',
      );
    if (refresh().length !== 1 || hmr().length)
      throw new Error('scaffold HMR boundary failed');
    sent.length = 0;
    const save = await post('/__catalog-local-authoring/save', {
      baseRevision: 'loaded',
      exampleId: 'example',
      files: [
        { path: 'workflow.ts', content: 'export const workflow = false;\n' },
      ],
      operationId: 'save',
    });
    if (
      save.status !== 200 ||
      !(await save.text()).includes('"kind":"terminal"')
    )
      throw new Error('save failed');
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (refresh().length !== 1 || hmr().length)
      throw new Error('save HMR boundary failed');
    sent.length = 0;
    await new Promise((resolve) => setTimeout(resolve, 1_050));
    await writeFile(paths[3]!, `${await readFile(paths[3]!, 'utf8')}\n`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!hmr().length) throw new Error('external HMR was suppressed');
    const projectServer = await createServer({
      logLevel: 'silent',
      mode: 'test',
    });
    try {
      for (const path of [
        'src/lib/catalog/worker/examples/index.ts',
        'src/lib/catalog/worker/workflows.ts',
      ]) {
        if (
          projectServer.config.configFileDependencies.some((dependency) =>
            dependency.endsWith(path),
          )
        )
          throw new Error('generated config dependency');
      }
      const module = await projectServer.ssrLoadModule(
        '/scripts/catalog/ui-authoring.ts',
      );
      if (!module.createUiCatalogAuthoring)
        throw new Error('SSR authoring loader unavailable');
    } finally {
      await projectServer.close();
    }
    process.stdout.write(JSON.stringify({ status: 'ok' }));
  } finally {
    await server.close();
    await rm(root, { force: true, recursive: true });
  }
})();

import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { archivePreviewBundle, startArchivedPreview } from './archived-preview';

const temporaryDirectories: string[] = [];

const createPreviewSources = async () => {
  const temporaryRoot = path.join(process.cwd(), 'migration-evidence');
  await mkdir(temporaryRoot, { recursive: true });
  const root = await mkdtemp(
    path.join(temporaryRoot, 'migration-archived-preview-'),
  );
  temporaryDirectories.push(root);
  const buildDirectory = path.join(root, 'build');
  const deployedNodeModulesDirectory = path.join(
    root,
    'deployed',
    'node_modules',
  );
  const outputDirectory = path.join(root, 'output');
  const serverDirectory = path.join(outputDirectory, 'server');
  const runtimePackageDirectory = path.join(
    deployedNodeModulesDirectory,
    'archive-runtime-probe',
  );
  await mkdir(path.join(buildDirectory, '_app'), { recursive: true });
  await mkdir(serverDirectory, { recursive: true });
  await mkdir(runtimePackageDirectory, { recursive: true });
  await writeFile(
    path.join(runtimePackageDirectory, 'package.json'),
    JSON.stringify({
      name: 'archive-runtime-probe',
      type: 'module',
      exports: './index.js',
    }),
  );
  await writeFile(
    path.join(runtimePackageDirectory, 'index.js'),
    "export const runtimeValue = 'archived runtime';",
  );
  await writeFile(
    path.join(buildDirectory, 'index.html'),
    '<html><body>archived static shell</body></html>',
  );
  await writeFile(path.join(buildDirectory, '_app', 'asset.js'), 'archived();');
  await writeFile(
    path.join(serverDirectory, 'index.js'),
    `import { runtimeValue } from 'archive-runtime-probe';
    export class Server {
      async init() {}
      async respond(request) {
        const pathname = new URL(request.url).pathname;
        const body = pathname === '/render'
          ? \`<h1>Archived render: \${runtimeValue}</h1>\`
          : '<h1>Archived SPA</h1>';
        const headers = new Headers({
          'content-type': 'text/html',
          link: '</_app/immutable/entry/start.js>; rel="modulepreload"'
        });
        if (pathname === '/cookies') {
          const response = new Response(body, { headers });
          Object.defineProperty(response.headers, 'getSetCookie', {
            value: () => [
              'first=one; Path=/; HttpOnly',
              'second=two; Path=/; SameSite=Lax'
            ]
          });
          return response;
        }
        return new Response(body, {
          headers,
          status: pathname === '/missing' ? 404 : 200
        });
      }
    }`,
  );
  await writeFile(
    path.join(serverDirectory, 'manifest-full.js'),
    'export const manifest = { archived: true };',
  );
  await writeFile(
    path.join(serverDirectory, 'internal.js'),
    'export const set_assets = () => {};',
  );

  return {
    buildDirectory,
    deployedNodeModulesDirectory,
    outputDirectory,
    root,
    runtimePackageDirectory,
  };
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('archived preview', () => {
  it('resolves bare imports from archived node_modules after sources are removed', async () => {
    const {
      buildDirectory,
      deployedNodeModulesDirectory,
      outputDirectory,
      root,
    } = await createPreviewSources();
    const archiveDirectory = path.join(root, 'archive');
    const inventoryPath = path.join(root, 'archive.inventory.json');
    const descriptor = await archivePreviewBundle({
      archiveDirectory,
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath,
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });
    await rm(buildDirectory, { force: true, recursive: true });
    await rm(outputDirectory, { force: true, recursive: true });
    await rm(deployedNodeModulesDirectory, { force: true, recursive: true });

    const preview = await startArchivedPreview({
      archiveDirectory,
      host: '127.0.0.1',
      port: 0,
    });
    try {
      const response = await fetch(new URL('/render', preview.url));

      expect(await response.text()).toContain(
        'Archived render: archived runtime',
      );
      expect(response.headers.get('x-migration-evidence-provenance-id')).toBe(
        'commit:lockfile',
      );
      expect(response.headers.get('x-migration-evidence-bundle-sha256')).toBe(
        descriptor.bundleSha256,
      );
    } finally {
      await preview.close();
    }
  });

  it('serves archived static assets without invoking the server bundle', async () => {
    const {
      buildDirectory,
      deployedNodeModulesDirectory,
      outputDirectory,
      root,
    } = await createPreviewSources();
    const archiveDirectory = path.join(root, 'archive');
    await archivePreviewBundle({
      archiveDirectory,
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath: path.join(root, 'archive.inventory.json'),
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });
    const preview = await startArchivedPreview({
      archiveDirectory,
      host: '127.0.0.1',
      port: 0,
    });
    try {
      const response = await fetch(new URL('/_app/asset.js', preview.url));

      expect(await response.text()).toBe('archived();');
    } finally {
      await preview.close();
    }
  });

  it('serves SPA routes from the archived server bundle', async () => {
    const {
      buildDirectory,
      deployedNodeModulesDirectory,
      outputDirectory,
      root,
    } = await createPreviewSources();
    const archiveDirectory = path.join(root, 'archive');
    await archivePreviewBundle({
      archiveDirectory,
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath: path.join(root, 'archive.inventory.json'),
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });
    await rm(buildDirectory, { force: true, recursive: true });
    await rm(outputDirectory, { force: true, recursive: true });
    const preview = await startArchivedPreview({
      archiveDirectory,
      host: '127.0.0.1',
      port: 0,
    });
    try {
      const response = await fetch(
        new URL('/namespaces/default/workflows', preview.url),
      );

      expect(await response.text()).toContain('Archived SPA');
      expect(response.headers.get('link')).toBeNull();
    } finally {
      await preview.close();
    }
  });

  it('stops accepting requests after clean shutdown', async () => {
    const {
      buildDirectory,
      deployedNodeModulesDirectory,
      outputDirectory,
      root,
    } = await createPreviewSources();
    const archiveDirectory = path.join(root, 'archive');
    await archivePreviewBundle({
      archiveDirectory,
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath: path.join(root, 'archive.inventory.json'),
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });
    const preview = await startArchivedPreview({
      archiveDirectory,
      host: '127.0.0.1',
      port: 0,
    });

    await preview.close();

    await expect(fetch(preview.url)).rejects.toThrow();
  });

  it('rejects an archived symlink whose target escapes the archive', async () => {
    const {
      buildDirectory,
      deployedNodeModulesDirectory,
      outputDirectory,
      root,
    } = await createPreviewSources();
    const archiveDirectory = path.join(root, 'archive');
    await archivePreviewBundle({
      archiveDirectory,
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath: path.join(root, 'archive.inventory.json'),
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });
    const outsideDirectory = path.join(root, 'outside');
    await mkdir(outsideDirectory);
    await symlink(
      outsideDirectory,
      path.join(archiveDirectory, 'node_modules', 'outside-link'),
      'dir',
    );

    await expect(
      startArchivedPreview({
        archiveDirectory,
        host: '127.0.0.1',
        port: 0,
      }),
    ).rejects.toThrow('escapes the archive');
  });

  it('changes bundle identity when an archived runtime package changes', async () => {
    const {
      buildDirectory,
      deployedNodeModulesDirectory,
      outputDirectory,
      root,
      runtimePackageDirectory,
    } = await createPreviewSources();
    const first = await archivePreviewBundle({
      archiveDirectory: path.join(root, 'first-archive'),
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath: path.join(root, 'first-archive.inventory.json'),
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });
    await writeFile(
      path.join(runtimePackageDirectory, 'index.js'),
      "export const runtimeValue = 'mutated runtime';",
    );
    const second = await archivePreviewBundle({
      archiveDirectory: path.join(root, 'second-archive'),
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath: path.join(root, 'second-archive.inventory.json'),
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });

    expect(second.bundleSha256).not.toBe(first.bundleSha256);
  });

  it('preserves duplicate Set-Cookie response headers', async () => {
    const {
      buildDirectory,
      deployedNodeModulesDirectory,
      outputDirectory,
      root,
    } = await createPreviewSources();
    const archiveDirectory = path.join(root, 'archive');
    await archivePreviewBundle({
      archiveDirectory,
      buildDirectory,
      deployedNodeModulesDirectory,
      inventoryPath: path.join(root, 'archive.inventory.json'),
      provenanceId: 'commit:lockfile',
      svelteOutputDirectory: outputDirectory,
    });
    const preview = await startArchivedPreview({
      archiveDirectory,
      host: '127.0.0.1',
      port: 0,
    });
    try {
      const response = await fetch(new URL('/cookies', preview.url));

      expect(response.headers.getSetCookie()).toEqual([
        'first=one; Path=/; HttpOnly',
        'second=two; Path=/; SameSite=Lax',
      ]);
    } finally {
      await preview.close();
    }
  });
});

import {
  mkdir,
  readdir,
  readFile,
  realpath,
  stat,
  writeFile,
} from 'node:fs/promises';
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from 'node:http';
import { createServer } from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  archiveBuild,
  artifactContentIdentity,
  writeArtifactInventory,
} from './artifact-inventory';
import { buildIdentityForIndexFile } from './evidence-run';

const provenanceHeader = 'x-migration-evidence-provenance-id';
const bundleHeader = 'x-migration-evidence-bundle-sha256';

type PreviewBundleMetadata = {
  version: 1;
  provenanceId: string;
};

export type ArchivedPreviewDescriptor = {
  version: 1;
  archiveDirectory: string;
  buildSha256: string;
  bundleSha256: string;
  provenanceId: string;
};

type ArchivedServer = {
  init: (options: {
    env: NodeJS.ProcessEnv;
    read: (file: string) => Promise<Uint8Array>;
  }) => Promise<void>;
  respond: (
    request: Request,
    options: { getClientAddress: () => string },
  ) => Promise<Response>;
};

type ArchivedServerConstructor = new (manifest: unknown) => ArchivedServer;

const assertProvenanceId = (provenanceId: string): void => {
  if (!provenanceId || /[\r\n]/.test(provenanceId)) {
    throw new Error('A non-empty single-line provenance ID is required');
  }
};

export const archivePreviewBundle = async ({
  archiveDirectory,
  buildDirectory,
  deployedNodeModulesDirectory,
  descriptorPath,
  inventoryPath,
  provenanceId,
  svelteOutputDirectory,
}: {
  archiveDirectory: string;
  buildDirectory: string;
  deployedNodeModulesDirectory: string;
  descriptorPath?: string;
  inventoryPath: string;
  provenanceId: string;
  svelteOutputDirectory: string;
}): Promise<ArchivedPreviewDescriptor> => {
  assertProvenanceId(provenanceId);
  const archive = path.resolve(archiveDirectory);
  await mkdir(path.dirname(archive), { recursive: true });
  await mkdir(archive);
  await archiveBuild(buildDirectory, path.join(archive, 'static'));
  await archiveBuild(
    svelteOutputDirectory,
    path.join(archive, 'svelte-kit-output'),
  );
  await archiveBuild(
    deployedNodeModulesDirectory,
    path.join(archive, 'node_modules'),
  );
  const metadata: PreviewBundleMetadata = { version: 1, provenanceId };
  await writeFile(
    path.join(archive, 'preview-bundle.json'),
    `${JSON.stringify(metadata, null, 2)}\n`,
    { flag: 'wx' },
  );
  await writeFile(
    path.join(archive, 'package.json'),
    `${JSON.stringify({ type: 'module' }, null, 2)}\n`,
    { flag: 'wx' },
  );

  const inventory = await writeArtifactInventory(archive, inventoryPath);
  const descriptor: ArchivedPreviewDescriptor = {
    version: 1,
    archiveDirectory: archive,
    buildSha256: await buildIdentityForIndexFile(
      path.join(archive, 'static', 'index.html'),
    ),
    bundleSha256: inventory.sha256,
    provenanceId,
  };

  if (descriptorPath) {
    await mkdir(path.dirname(path.resolve(descriptorPath)), {
      recursive: true,
    });
    await writeFile(
      descriptorPath,
      `${JSON.stringify(descriptor, null, 2)}\n`,
      { flag: 'wx' },
    );
  }

  return descriptor;
};

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const staticFileForRequest = async (
  staticDirectory: string,
  pathname: string,
): Promise<string | null> => {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decodedPath.endsWith('/') || decodedPath === '/index.html') return null;

  const candidate = path.resolve(
    staticDirectory,
    decodedPath.replace(/^\/+/, ''),
  );
  const staticRoot = await realpath(staticDirectory);
  let resolved: string;
  try {
    resolved = await realpath(candidate);
  } catch {
    return null;
  }
  const relative = path.relative(staticRoot, resolved);
  if (
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    return null;
  }
  return (await stat(resolved)).isFile() ? resolved : null;
};

const requestHeaders = (headers: IncomingHttpHeaders): Headers => {
  const result = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const entry of value) result.append(name, entry);
    } else if (value !== undefined) {
      result.set(name, value);
    }
  }
  return result;
};

const toRequest = (request: IncomingMessage, origin: string): Request => {
  const method = request.method ?? 'GET';
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : Readable.toWeb(request);
  return new Request(new URL(request.url ?? '/', origin), {
    method,
    headers: requestHeaders(request.headers),
    body,
    ...(body ? { duplex: 'half' as const } : {}),
  } as RequestInit & { duplex?: 'half' });
};

const sendResponse = async (
  response: Response,
  outgoing: ServerResponse,
  provenanceId: string,
  bundleSha256: string,
): Promise<void> => {
  outgoing.statusCode = response.status;
  outgoing.statusMessage = response.statusText;
  for (const [name, value] of response.headers) {
    const normalizedName = name.toLowerCase();
    if (normalizedName !== 'link' && normalizedName !== 'set-cookie') {
      outgoing.setHeader(name, value);
    }
  }
  for (const cookie of response.headers.getSetCookie()) {
    outgoing.appendHeader('set-cookie', cookie);
  }
  outgoing.setHeader(provenanceHeader, provenanceId);
  outgoing.setHeader(bundleHeader, bundleSha256);

  if (!response.body) {
    outgoing.end();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const body = Readable.fromWeb(response.body as never);
    body.once('error', reject);
    outgoing.once('error', reject);
    outgoing.once('finish', resolve);
    body.pipe(outgoing);
  });
};

const readMetadata = async (
  archiveDirectory: string,
): Promise<PreviewBundleMetadata> => {
  const value = JSON.parse(
    await readFile(path.join(archiveDirectory, 'preview-bundle.json'), 'utf8'),
  ) as Partial<PreviewBundleMetadata>;
  if (value.version !== 1 || typeof value.provenanceId !== 'string') {
    throw new Error('Invalid archived preview metadata');
  }
  assertProvenanceId(value.provenanceId);
  return { version: 1, provenanceId: value.provenanceId };
};

const assertArchivedSymlinksContained = async (
  archiveDirectory: string,
  directory = archiveDirectory,
): Promise<void> => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      let target: string;
      try {
        target = await realpath(entryPath);
      } catch {
        throw new Error(`Archived symlink cannot be resolved: ${entryPath}`);
      }
      const relativeTarget = path.relative(archiveDirectory, target);
      if (
        relativeTarget === '..' ||
        relativeTarget.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativeTarget)
      ) {
        throw new Error(`Archived symlink escapes the archive: ${entryPath}`);
      }
    } else if (entry.isDirectory()) {
      await assertArchivedSymlinksContained(archiveDirectory, entryPath);
    }
  }
};

export const startArchivedPreview = async ({
  archiveDirectory,
  host = '127.0.0.1',
  port,
}: {
  archiveDirectory: string;
  host?: string;
  port: number;
}) => {
  const archive = await realpath(path.resolve(archiveDirectory));
  await assertArchivedSymlinksContained(archive);
  const staticDirectory = path.join(archive, 'static');
  const serverDirectory = path.join(archive, 'svelte-kit-output', 'server');
  const metadata = await readMetadata(archive);
  const bundleSha256 = await artifactContentIdentity(archive);
  const [{ Server }, { manifest }, internal] = (await Promise.all([
    import(pathToFileURL(path.join(serverDirectory, 'index.js')).href),
    import(pathToFileURL(path.join(serverDirectory, 'manifest-full.js')).href),
    import(pathToFileURL(path.join(serverDirectory, 'internal.js')).href),
  ])) as [
    { Server: ArchivedServerConstructor },
    { manifest: unknown },
    { set_assets: (assets: string) => void },
  ];
  internal.set_assets('');
  const application = new Server(manifest);
  await application.init({
    env: process.env,
    read: async (file) => readFile(path.join(staticDirectory, file)),
  });

  const listener = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`);
      const staticFile = await staticFileForRequest(
        staticDirectory,
        requestUrl.pathname,
      );
      if (staticFile) {
        const body = await readFile(staticFile);
        await sendResponse(
          new Response(Uint8Array.from(body), {
            headers: {
              'content-type':
                contentTypes[path.extname(staticFile).toLowerCase()] ??
                'application/octet-stream',
            },
          }),
          response,
          metadata.provenanceId,
          bundleSha256,
        );
        return;
      }

      const applicationResponse = await application.respond(
        toRequest(request, requestUrl.origin),
        {
          getClientAddress: () => request.socket.remoteAddress ?? '127.0.0.1',
        },
      );
      await sendResponse(
        applicationResponse,
        response,
        metadata.provenanceId,
        bundleSha256,
      );
    } catch (error) {
      await sendResponse(
        new Response(
          error instanceof Error ? error.message : 'Archived preview error',
          { status: 500 },
        ),
        response,
        metadata.provenanceId,
        bundleSha256,
      );
    }
  });

  await new Promise<void>((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(port, host, resolve);
  });
  const address = listener.address();
  if (!address || typeof address === 'string') {
    throw new Error('Archived preview did not expose a TCP address');
  }
  const url = new URL(`http://${host}:${address.port}/`);
  let closed = false;

  return {
    url,
    bundleSha256,
    provenanceId: metadata.provenanceId,
    close: async (): Promise<void> => {
      if (closed) return;
      closed = true;
      await new Promise<void>((resolve, reject) => {
        listener.close((error) => (error ? reject(error) : resolve()));
        listener.closeAllConnections();
      });
    },
  };
};

const argumentValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

const requiredArgument = (name: string): string => {
  const value = argumentValue(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const run = async (): Promise<void> => {
  const command = process.argv[2];
  if (command === 'archive') {
    const descriptor = await archivePreviewBundle({
      archiveDirectory: requiredArgument('--archive'),
      buildDirectory: requiredArgument('--build'),
      deployedNodeModulesDirectory: requiredArgument('--node-modules'),
      descriptorPath: requiredArgument('--descriptor'),
      inventoryPath: requiredArgument('--inventory'),
      provenanceId: requiredArgument('--provenance-id'),
      svelteOutputDirectory: requiredArgument('--svelte-output'),
    });
    process.stdout.write(`${JSON.stringify(descriptor)}\n`);
    return;
  }
  if (command === 'serve') {
    const preview = await startArchivedPreview({
      archiveDirectory: requiredArgument('--archive'),
      host: argumentValue('--host') ?? '127.0.0.1',
      port: Number(requiredArgument('--port')),
    });
    process.stdout.write(
      `Archived preview ${preview.provenanceId} listening at ${preview.url.href}\n`,
    );
    const shutdown = async () => {
      await preview.close();
      process.exitCode = 0;
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    return;
  }
  throw new Error(
    'Usage: archived-preview.ts <archive|serve> with the required options',
  );
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  });
}

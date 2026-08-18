import type { IncomingMessage, ServerResponse } from 'node:http';
import { join, normalize, sep } from 'node:path';

import type { createUiCatalogAuthoring } from '../scripts/catalog/ui-authoring';
import { uiCatalogGeneratedPaths } from '../scripts/catalog/ui-authoring-generated-paths';

export const catalogLocalAuthoringBasePath = '/__catalog-local-authoring';

type CatalogLocalAuthoring = ReturnType<typeof createUiCatalogAuthoring>;
type CatalogSaveTerminalEvent = Awaited<
  ReturnType<CatalogLocalAuthoring['save']>
>;

export type CatalogLocalAuthoringMutation =
  | { exampleId: string; kind: 'scaffold' }
  | { kind: 'save'; terminal: CatalogSaveTerminalEvent };

export type CatalogLocalAuthoringBridgeOptions = {
  authoring?: CatalogLocalAuthoring;
  loadAuthoring?: (rootDirectory: string) => Promise<CatalogLocalAuthoring>;
  onMutationDelivered?: (mutation: CatalogLocalAuthoringMutation) => void;
  onSaveEvent?: Parameters<CatalogLocalAuthoring['save']>[1];
  rootDirectory: string;
};

type BridgeMiddleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => void;

class BridgeHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const hasExactKeys = (
  value: Record<string, unknown>,
  required: readonly string[],
) =>
  Object.keys(value).length === required.length &&
  required.every((key) => key in value);

const isLoopbackHostname = (hostname: string) =>
  hostname === 'localhost' ||
  hostname === '[::1]' ||
  /^127(?:\.\d{1,3}){3}$/.test(hostname);

const isLoopbackAddress = (address: string | undefined) =>
  address === '::1' ||
  Boolean(address?.match(/^127(?:\.\d{1,3}){3}$/)) ||
  Boolean(address?.match(/^::ffff:127(?:\.\d{1,3}){3}$/i));

const assertLoopbackRequest = (request: IncomingMessage) => {
  if (!isLoopbackAddress(request.socket.remoteAddress)) {
    throw new BridgeHttpError(403, 'Local catalog authoring requires loopback');
  }
  const host = request.headers.host;
  if (!host) throw new BridgeHttpError(403, 'Host is required');
  let hostname: string;
  try {
    hostname = new URL(`http://${host}`).hostname;
  } catch {
    throw new BridgeHttpError(403, 'Host is invalid');
  }
  if (!isLoopbackHostname(hostname)) {
    throw new BridgeHttpError(403, 'Local catalog authoring requires loopback');
  }
  const origin = request.headers.origin;
  if (origin) {
    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      throw new BridgeHttpError(403, 'Origin is invalid');
    }
    if (
      !['http:', 'https:'].includes(originUrl.protocol) ||
      !isLoopbackHostname(originUrl.hostname) ||
      originUrl.host !== host
    ) {
      throw new BridgeHttpError(403, 'Origin is not allowed');
    }
  }
};

const readJson = async (request: IncomingMessage): Promise<unknown> => {
  if (
    request.headers['content-type']?.split(';', 1)[0] !== 'application/json'
  ) {
    throw new BridgeHttpError(415, 'JSON content type is required');
  }
  const declaredLength = Number(request.headers['content-length'] ?? 0);
  if (declaredLength > 1024 * 1024) {
    throw new BridgeHttpError(413, 'Request body is too large');
  }
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += buffer.length;
    if (length > 1024 * 1024) {
      throw new BridgeHttpError(413, 'Request body is too large');
    }
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new BridgeHttpError(400, 'Request body must be valid JSON');
  }
};

const sendJson = (response: ServerResponse, status: number, value: unknown) => {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(`${JSON.stringify(value)}\n`);
};

const requireMethod = (request: IncomingMessage, method: string) => {
  if (request.method === method) return;
  throw new BridgeHttpError(405, `Method must be ${method}`);
};

const decodePathPart = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new BridgeHttpError(400, 'Path parameter is invalid');
  }
};

const isOperationId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length >= 1 &&
  value.length <= 128 &&
  /^[a-zA-Z0-9._:-]+$/.test(value);

const isExampleId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 128 &&
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);

const isSaveRequest = (
  value: unknown,
): value is Parameters<CatalogLocalAuthoring['save']>[0] => {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      'baseRevision',
      'exampleId',
      'files',
      'operationId',
    ]) ||
    typeof value.baseRevision !== 'string' ||
    !isExampleId(value.exampleId) ||
    !isOperationId(value.operationId) ||
    !Array.isArray(value.files)
  ) {
    return false;
  }
  return value.files.every((file) => {
    if (!isRecord(file)) return false;
    const keys = Object.keys(file);
    if (
      keys.length < 2 ||
      keys.length > 3 ||
      !keys.every((key) => ['content', 'path', 'removed'].includes(key)) ||
      typeof file.content !== 'string' ||
      typeof file.path !== 'string'
    ) {
      return false;
    }
    return file.removed === undefined || file.removed === true;
  });
};

const isSavedState = (
  value: unknown,
): value is { durability: 'durable'; status: 'saved' } =>
  isRecord(value) &&
  hasExactKeys(value, ['durability', 'status']) &&
  value.durability === 'durable' &&
  value.status === 'saved';

const isPreviewSaveState = (
  value: unknown,
): value is Parameters<
  CatalogLocalAuthoring['previewPromote']
>[0]['saveState'] =>
  isSavedState(value) ||
  (isRecord(value) &&
    hasExactKeys(value, ['status']) &&
    ['dirty', 'failed', 'stale'].includes(String(value.status)));

export const createCatalogLocalAuthoringBridge = ({
  authoring,
  loadAuthoring,
  onMutationDelivered,
  onSaveEvent,
  rootDirectory,
}: CatalogLocalAuthoringBridgeOptions): {
  middleware: BridgeMiddleware;
  shouldSuppressWatchEvent: (path: string) => boolean;
} => {
  let authoringPromise: Promise<CatalogLocalAuthoring> | undefined;
  const resolveAuthoring = () => {
    authoringPromise ??= authoring
      ? Promise.resolve(authoring)
      : (loadAuthoring?.(rootDirectory) ??
        Promise.reject(
          new Error('Local catalog authoring loader is unavailable'),
        ));
    return authoringPromise;
  };
  const ownedSourceRoot = join(rootDirectory, 'catalog.local/examples');
  const ownedGeneratedPaths = new Set(
    uiCatalogGeneratedPaths.map((path) => normalize(join(rootDirectory, path))),
  );
  let activeOperationId: string | undefined;
  let ownedMutationInProgress = 0;
  let suppressOwnedEventsUntil = 0;
  const isOwnedPath = (path: string) => {
    const normalizedPath = normalize(path);
    return (
      ownedGeneratedPaths.has(normalizedPath) ||
      normalizedPath === ownedSourceRoot ||
      normalizedPath.startsWith(`${ownedSourceRoot}${sep}`)
    );
  };
  const observeSaveEvent: NonNullable<
    CatalogLocalAuthoringBridgeOptions['onSaveEvent']
  > = (event) => {
    if (
      event.kind === 'check' &&
      event.step === 'write_files' &&
      event.state === 'started'
    ) {
      activeOperationId = event.operationId;
    }
    if (event.kind === 'terminal' && event.operationId === activeOperationId) {
      activeOperationId = undefined;
      suppressOwnedEventsUntil = Date.now() + 1_000;
    }
    try {
      onSaveEvent?.(event);
    } catch {
      // The watcher projection cannot alter core operation truth.
    }
  };
  const notifyMutationDelivered = (mutation: CatalogLocalAuthoringMutation) => {
    try {
      onMutationDelivered?.(mutation);
    } catch {
      // Refresh projections cannot alter core operation truth.
    }
  };
  return {
    shouldSuppressWatchEvent: (path) =>
      isOwnedPath(path) &&
      (ownedMutationInProgress > 0 ||
        activeOperationId !== undefined ||
        Date.now() <= suppressOwnedEventsUntil),
    middleware(request, response, next) {
      const run = async () => {
        const pathname = new URL(request.url ?? '/', 'http://localhost')
          .pathname;
        if (
          pathname !== catalogLocalAuthoringBasePath &&
          !pathname.startsWith(`${catalogLocalAuthoringBasePath}/`)
        ) {
          next();
          return;
        }
        assertLoopbackRequest(request);
        if (pathname === `${catalogLocalAuthoringBasePath}/scaffold`) {
          requireMethod(request, 'POST');
          const body = await readJson(request);
          if (
            !isRecord(body) ||
            !hasExactKeys(body, ['exampleId']) ||
            !isExampleId(body.exampleId)
          ) {
            throw new BridgeHttpError(400, 'Invalid scaffold request');
          }
          const exampleId = body.exampleId;
          ownedMutationInProgress += 1;
          try {
            await (await resolveAuthoring()).scaffold(body.exampleId);
          } finally {
            ownedMutationInProgress -= 1;
            suppressOwnedEventsUntil = Date.now() + 1_000;
          }
          response.once('finish', () =>
            notifyMutationDelivered({
              exampleId,
              kind: 'scaffold',
            }),
          );
          response.statusCode = 204;
          response.end();
          return;
        }
        if (pathname === `${catalogLocalAuthoringBasePath}/save`) {
          requireMethod(request, 'POST');
          const body = await readJson(request);
          if (!isSaveRequest(body)) {
            throw new BridgeHttpError(400, 'Invalid Save request');
          }
          response.statusCode = 200;
          response.setHeader(
            'content-type',
            'application/x-ndjson; charset=utf-8',
          );
          let terminal: CatalogSaveTerminalEvent | undefined;
          try {
            await (
              await resolveAuthoring()
            ).save(body, (event) => {
              if (!response.destroyed) {
                response.write(`${JSON.stringify(event)}\n`);
              }
              if (event.kind === 'terminal') terminal = event;
              try {
                observeSaveEvent(event);
              } catch {
                // Watcher projections never own the Save operation.
              }
            });
          } finally {
            if (activeOperationId === body.operationId) {
              activeOperationId = undefined;
              suppressOwnedEventsUntil = Date.now() + 1_000;
            }
          }
          if (terminal && !response.destroyed) {
            const deliveredTerminal = terminal;
            response.once('finish', () =>
              notifyMutationDelivered({
                kind: 'save',
                terminal: deliveredTerminal,
              }),
            );
          }
          if (!response.destroyed) response.end();
          return;
        }
        if (
          pathname === `${catalogLocalAuthoringBasePath}/promotions/preview`
        ) {
          requireMethod(request, 'POST');
          const body = await readJson(request);
          if (
            !isRecord(body) ||
            !hasExactKeys(body, ['exampleId', 'saveState']) ||
            !isExampleId(body.exampleId) ||
            !isPreviewSaveState(body.saveState)
          ) {
            throw new BridgeHttpError(400, 'Invalid promotion preview request');
          }
          sendJson(
            response,
            200,
            await (
              await resolveAuthoring()
            ).previewPromote({
              exampleId: body.exampleId,
              saveState: body.saveState,
            }),
          );
          return;
        }
        if (
          pathname === `${catalogLocalAuthoringBasePath}/promotions/confirm`
        ) {
          requireMethod(request, 'POST');
          const body = await readJson(request);
          if (
            !isRecord(body) ||
            !hasExactKeys(body, ['exampleId', 'revision', 'saveState']) ||
            !isExampleId(body.exampleId) ||
            typeof body.revision !== 'string' ||
            !isSavedState(body.saveState)
          ) {
            throw new BridgeHttpError(
              400,
              'Invalid promotion confirmation request',
            );
          }
          sendJson(
            response,
            200,
            await (
              await resolveAuthoring()
            ).confirmPromote({
              exampleId: body.exampleId,
              revision: body.revision,
              saveState: body.saveState,
            }),
          );
          return;
        }
        const operationMatch = pathname.match(
          /^\/__catalog-local-authoring\/operations\/([^/]+)$/,
        );
        if (operationMatch) {
          requireMethod(request, 'GET');
          const operationId = decodePathPart(operationMatch[1]!);
          if (!isOperationId(operationId)) {
            throw new BridgeHttpError(400, 'Invalid operation ID');
          }
          const inspection = await (
            await resolveAuthoring()
          ).inspectSaveOperation(operationId);
          if (!inspection) {
            throw new BridgeHttpError(404, 'Save operation was not found');
          }
          sendJson(response, 200, inspection);
          return;
        }
        const exampleMatch = pathname.match(
          /^\/__catalog-local-authoring\/examples\/([^/]+)$/,
        );
        if (exampleMatch) {
          requireMethod(request, 'GET');
          const exampleId = decodePathPart(exampleMatch[1]!);
          if (!isExampleId(exampleId)) {
            throw new BridgeHttpError(400, 'Invalid example ID');
          }
          const example = (
            await (await resolveAuthoring()).loadExamples()
          ).find(
            ({ id, sourceId }) => id === exampleId && sourceId === 'local',
          );
          if (!example) throw new BridgeHttpError(404, 'Example was not found');
          sendJson(response, 200, example);
          return;
        }
        throw new BridgeHttpError(404, 'Authoring endpoint was not found');
      };
      void run().catch((error) => {
        const status = error instanceof BridgeHttpError ? error.status : 500;
        if (response.headersSent) {
          if (!response.writableEnded) response.end();
          return;
        }
        sendJson(response, status, {
          error:
            error instanceof BridgeHttpError
              ? error.message
              : 'Local catalog authoring failed',
        });
      });
    },
  };
};

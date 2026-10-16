import type {
  ConsoleMessage,
  Frame,
  Page,
  Request,
  Response,
} from '@playwright/test';

import {
  type ApiRequestEvidence,
  categorizeRequestBody,
  normalizeApiUrl,
  summarizeApiRequests,
} from '../../scripts/vite-migration/api-evidence';

type Normalize = (value: string) => string;

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const requestBlocksEvidenceSettlement = (
  resourceType: string,
  isApplicationApiRequest: boolean,
): boolean => {
  return isApplicationApiRequest || resourceType !== 'media';
};

export class EvidenceTracker {
  readonly #page: Page;
  readonly #normalize: Normalize;
  readonly #activeRequests = new Set<Request>();
  readonly #apiRequests = new Map<Request, ApiRequestEvidence>();
  readonly #pendingUpdates: Promise<void>[] = [];
  readonly #consoleMessages: {
    type: string;
    text: string;
    location: {
      url: string;
      lineNumber: number;
      columnNumber: number;
    } | null;
  }[] = [];
  readonly #pageErrors: string[] = [];
  readonly #mainFrameNavigations: string[] = [];
  #lastActivity = Date.now();
  #started = false;

  constructor(page: Page, normalize: Normalize) {
    this.#page = page;
    this.#normalize = normalize;
  }

  #isApplicationApiRequest = (request: Request): boolean => {
    return new URL(request.url()).pathname.startsWith('/api/');
  };

  #onRequest = (request: Request): void => {
    const isApplicationApiRequest = this.#isApplicationApiRequest(request);
    if (
      requestBlocksEvidenceSettlement(
        request.resourceType(),
        isApplicationApiRequest,
      )
    ) {
      this.#activeRequests.add(request);
    }
    this.#lastActivity = Date.now();

    if (!isApplicationApiRequest) return;

    const { path, query } = normalizeApiUrl(request.url());
    this.#apiRequests.set(request, {
      method: request.method(),
      path,
      query,
      bodyCategory: categorizeRequestBody(
        request.postData(),
        request.headers()['content-type'] ?? null,
      ),
      status: null,
      failure: null,
      mock: null,
    });
  };

  #onResponse = (response: Response): void => {
    const evidence = this.#apiRequests.get(response.request());
    if (!evidence) return;

    evidence.status = response.status();
    const update = response
      .headerValue('x-migration-evidence-mock')
      .then((mock) => {
        evidence.mock = mock;
      });
    this.#pendingUpdates.push(update);
    this.#lastActivity = Date.now();
  };

  #onRequestFinished = (request: Request): void => {
    if (!this.#activeRequests.delete(request)) return;
    this.#lastActivity = Date.now();
  };

  #onRequestFailed = (request: Request): void => {
    const evidence = this.#apiRequests.get(request);
    if (evidence) {
      evidence.failure = request.failure()?.errorText ?? 'request failed';
    }
    this.#activeRequests.delete(request);
    this.#lastActivity = Date.now();
  };

  #onFrameNavigated = (frame: Frame): void => {
    if (frame !== this.#page.mainFrame()) return;

    this.#mainFrameNavigations.push(this.#normalize(frame.url()));
    this.#lastActivity = Date.now();
  };

  #onConsole = (message: ConsoleMessage): void => {
    const location = message.location();
    this.#consoleMessages.push({
      type: message.type(),
      text: this.#normalize(message.text()),
      location: location.url
        ? {
            url: this.#normalize(location.url),
            lineNumber: location.lineNumber,
            columnNumber: location.columnNumber,
          }
        : null,
    });
    this.#lastActivity = Date.now();
  };

  #onPageError = (error: Error): void => {
    this.#pageErrors.push(this.#normalize(error.stack ?? error.message));
    this.#lastActivity = Date.now();
  };

  start(): void {
    if (this.#started) throw new Error('Evidence tracker already started');
    this.#started = true;
    this.#page.on('request', this.#onRequest);
    this.#page.on('response', this.#onResponse);
    this.#page.on('requestfinished', this.#onRequestFinished);
    this.#page.on('requestfailed', this.#onRequestFailed);
    this.#page.on('framenavigated', this.#onFrameNavigated);
    this.#page.on('console', this.#onConsole);
    this.#page.on('pageerror', this.#onPageError);
  }

  async waitForQuiet({
    quietMilliseconds = 300,
    timeoutMilliseconds = 7000,
  } = {}): Promise<void> {
    const deadline = Date.now() + timeoutMilliseconds;

    while (
      this.#activeRequests.size > 0 ||
      Date.now() - this.#lastActivity < quietMilliseconds
    ) {
      if (Date.now() >= deadline) {
        const activeRequests = [...this.#activeRequests]
          .map((request) => this.#normalize(request.url()))
          .sort();
        throw new Error(
          `Evidence settlement timed out with ${this.#activeRequests.size} active requests: ${activeRequests.join(', ')}`,
        );
      }
      await delay(Math.min(quietMilliseconds, 50));
    }

    await Promise.all(this.#pendingUpdates);
  }

  stop() {
    if (!this.#started) throw new Error('Evidence tracker was not started');
    this.#page.off('request', this.#onRequest);
    this.#page.off('response', this.#onResponse);
    this.#page.off('requestfinished', this.#onRequestFinished);
    this.#page.off('requestfailed', this.#onRequestFailed);
    this.#page.off('framenavigated', this.#onFrameNavigated);
    this.#page.off('console', this.#onConsole);
    this.#page.off('pageerror', this.#onPageError);
    this.#started = false;

    return {
      appApiRequests: summarizeApiRequests([...this.#apiRequests.values()]),
      consoleMessages: [...this.#consoleMessages].sort((left, right) =>
        JSON.stringify(left).localeCompare(JSON.stringify(right)),
      ),
      pageErrors: [...this.#pageErrors].sort(),
      mainFrameNavigations: [...this.#mainFrameNavigations],
    };
  }
}

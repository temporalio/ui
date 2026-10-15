import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import {
  expect,
  type Page,
  type Request,
  type Response,
  test,
} from '@playwright/test';

import {
  installClientNavigationEvidenceMocks,
  installEvidenceMocks,
  installNavigationEvidenceMocks,
} from './evidence-mocks';
import { EvidenceTracker } from './evidence-tracker';
import {
  apiRequestsForParity,
  scenarioForParity,
} from '../../scripts/vite-migration/api-evidence';
import { clientNavigationForParity } from '../../scripts/vite-migration/client-navigation-evidence';
import {
  consoleMessagesForParity,
  normalizeEvidenceText,
  normalizeEvidenceUrl,
  normalizeSemanticText,
} from '../../scripts/vite-migration/evidence-normalization';
import {
  writeBufferExclusive,
  writeJsonExclusive,
} from '../../scripts/vite-migration/evidence-run';
import {
  type EvidenceCatchAllApi,
  type EvidenceKnownConsoleError,
  type EvidenceKnownPageError,
  type MigrationRoute,
  migrationRouteFamilyScenarios,
  migrationRouteManifest,
} from '../../scripts/vite-migration/route-manifest';
import {
  type ScreenshotSample,
  screenshotSampleWidth,
} from '../../scripts/vite-migration/screenshot-evidence';

type Variant = 'baseline' | 'candidate';

type NavigationHop = {
  url: string;
  method: string;
  status: number | null;
};

const outputRoot = process.env.MIGRATION_EVIDENCE_OUTPUT_DIR;
const baselineUrl = process.env.MIGRATION_EVIDENCE_BASELINE_URL;
const candidateUrl = process.env.MIGRATION_EVIDENCE_CANDIDATE_URL;

if (!outputRoot || !baselineUrl || !candidateUrl) {
  throw new Error(
    'MIGRATION_EVIDENCE_OUTPUT_DIR, MIGRATION_EVIDENCE_BASELINE_URL, and MIGRATION_EVIDENCE_CANDIDATE_URL are required',
  );
}

const origins = [new URL(baselineUrl).origin, new URL(candidateUrl).origin];

const messageFor = (value: unknown): string => {
  return value instanceof Error ? value.message : String(value);
};

const classifyKnownConsoleError = (
  text: string,
): EvidenceKnownConsoleError | null => {
  if (
    text.includes('Blocked script execution in') &&
    text.includes('sandboxed') &&
    text.includes('allow-scripts')
  ) {
    return 'sandboxed-render-script';
  }

  if (
    text.includes("SyntaxError: Unexpected token 'E'") &&
    text.includes('"Error: 404" is not valid JSON')
  ) {
    return 'error-status-json-parse';
  }
  if (
    text.includes("SyntaxError: Unexpected token 'N'") &&
    text.includes('"Not Found" is not valid JSON')
  ) {
    return 'error-status-json-parse';
  }
  if (
    text ===
    'Failed to load resource: the server responded with a status of 404 (Not Found)'
  ) {
    return 'http-not-found-resource';
  }
  if (text.includes('Not found: /migration-evidence-not-found')) {
    return 'svelte-not-found-navigation';
  }

  return null;
};

const classifyKnownPageError = (
  text: string,
): EvidenceKnownPageError | null => {
  if (
    text.includes("Failed to execute 'getComputedStyle' on 'Window'") &&
    text.includes("parameter 1 is not of type 'Element'") &&
    text.includes('ResizeObserver')
  ) {
    return 'detached-resize-observer-element';
  }

  return null;
};

const assessPageErrors = (
  pageErrors: readonly string[],
  route: MigrationRoute,
) => {
  const observed = pageErrors.map((text) => ({
    text,
    classification: classifyKnownPageError(text),
  }));
  const unexpected = observed.filter(
    ({ classification }) =>
      classification === null ||
      !route.approvedPageErrors.includes(classification),
  );

  return { observed, unexpected };
};

const navigationHops = async (
  response: Response | null,
): Promise<NavigationHop[]> => {
  if (!response) return [];

  const requests: Request[] = [];
  let request: Request | null = response.request();

  while (request) {
    requests.unshift(request);
    request = request.redirectedFrom();
  }

  return Promise.all(
    requests.map(async (navigationRequest) => ({
      url: normalizeEvidenceUrl(navigationRequest.url(), origins),
      method: navigationRequest.method(),
      status: (await navigationRequest.response())?.status() ?? null,
    })),
  );
};

const prepareServerResponse = async (page: Page, initialUrl: string) => {
  const response = await fetch(initialUrl, {
    redirect: 'manual',
    signal: AbortSignal.timeout(5000),
  });
  const body = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const inertBody = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, '');

  await page.route(
    (url) => url.href === initialUrl,
    (route) =>
      route.fulfill({
        body: inertBody,
        contentType,
        status: response.status,
      }),
  );

  return {
    status: response.status,
    contentType,
    classification: /<h1(?:\s[^>]*)?>Migration evidence<\/h1>/.test(body)
      ? 'rendered-markdown'
      : 'unexpected-response',
  };
};

const collectSemanticPage = async (page: Page) => {
  const semantic = await page.evaluate(() => {
    const visible = (element: Element) => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.getClientRects().length > 0
      );
    };

    const accessibleName = (element: Element) => {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;

      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        const label = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
          .trim();
        if (label) return label;
      }

      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        const label = [...(element.labels ?? [])]
          .map((item) => item.textContent ?? '')
          .join(' ')
          .trim();
        if (label) return label;
      }

      return (
        element.getAttribute('alt') ??
        element.getAttribute('title') ??
        element.getAttribute('placeholder') ??
        element.textContent ??
        ''
      ).trim();
    };

    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter(visible)
      .map((element) => ({
        level: Number(element.tagName.slice(1)),
        name: accessibleName(element),
      }));

    const controlSelector = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="checkbox"]',
      '[role="combobox"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="radio"]',
      '[role="slider"]',
      '[role="switch"]',
      '[role="tab"]',
    ].join(',');

    const controls = [...document.querySelectorAll(controlSelector)]
      .filter(visible)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        type:
          element instanceof HTMLButtonElement ||
          element instanceof HTMLInputElement
            ? element.type
            : null,
        name: accessibleName(element),
        disabled:
          element.hasAttribute('disabled') ||
          element.getAttribute('aria-disabled') === 'true',
        checked: element.getAttribute('aria-checked'),
        expanded: element.getAttribute('aria-expanded'),
        pressed: element.getAttribute('aria-pressed'),
        selected: element.getAttribute('aria-selected'),
      }));

    return {
      title: document.title,
      headings,
      controls,
    };
  });

  let ariaSnapshot: string | null = null;
  let ariaSnapshotError: string | null = null;

  try {
    ariaSnapshot = await page.locator('body').ariaSnapshot();
  } catch (error) {
    ariaSnapshotError = messageFor(error);
  }

  return {
    title: normalizeSemanticText(semantic.title),
    headings: semantic.headings.map((heading) => ({
      ...heading,
      name: normalizeSemanticText(heading.name),
    })),
    controls: semantic.controls.map((control) => ({
      ...control,
      name: normalizeSemanticText(control.name),
    })),
    ariaSnapshot: ariaSnapshot
      ? normalizeEvidenceText(ariaSnapshot.replace(/\r\n?/g, '\n'), origins)
      : null,
    ariaSnapshotError: ariaSnapshotError
      ? normalizeEvidenceText(ariaSnapshotError, origins)
      : null,
  };
};

const collectAccessibility = async (page: Page) => {
  const results = await new AxeBuilder({ page }).analyze();

  return results.violations
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? null,
      nodes: violation.nodes
        .map((node) => ({
          target: node.target.map((target) => String(target)).sort(),
          failureSummary: normalizeSemanticText(node.failureSummary ?? ''),
        }))
        .sort((left, right) =>
          JSON.stringify(left).localeCompare(JSON.stringify(right)),
        ),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
};

const collectScreenshotSample = async (
  page: Page,
  screenshot: Buffer,
): Promise<ScreenshotSample> => {
  return page.evaluate(
    async ({ base64, width }) => {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (character) =>
        character.charCodeAt(0),
      );
      const bitmap = await createImageBitmap(
        new Blob([bytes], { type: 'image/jpeg' }),
      );
      const height = Math.round((bitmap.height / bitmap.width) * width);
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to create screenshot sample');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();

      const rgba = context.getImageData(0, 0, width, height).data;
      const rgb = new Uint8Array(width * height * 3);
      for (
        let rgbaIndex = 0, rgbIndex = 0;
        rgbaIndex < rgba.length;
        rgbaIndex += 4, rgbIndex += 3
      ) {
        rgb[rgbIndex] = rgba[rgbaIndex];
        rgb[rgbIndex + 1] = rgba[rgbaIndex + 1];
        rgb[rgbIndex + 2] = rgba[rgbaIndex + 2];
      }

      let rgbBinary = '';
      for (let offset = 0; offset < rgb.length; offset += 8192) {
        rgbBinary += String.fromCharCode(
          ...rgb.subarray(offset, offset + 8192),
        );
      }

      return {
        width,
        height,
        rgbBase64: btoa(rgbBinary),
      };
    },
    {
      base64: screenshot.toString('base64'),
      width: screenshotSampleWidth,
    },
  );
};

const configureEvidencePage = async (page: Page): Promise<void> => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    let uuidCounter = 0;
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: () => {
        uuidCounter += 1;
        return `00000000-0000-4000-8000-${uuidCounter
          .toString(16)
          .padStart(12, '0')}`;
      },
    });
  });
  await page.clock.setFixedTime(new Date('2025-01-15T12:00:00.000Z'));
};

const settleDocument = async (page: Page): Promise<void> => {
  await page.waitForLoadState('load', { timeout: 5000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
};

const runClientNavigation = async (
  page: Page,
  route: MigrationRoute,
  baseUrl: string,
  normalize: (value: string) => string,
) => {
  if (route.clientNavigation.kind === 'exempt') {
    return {
      kind: 'exempt' as const,
      reason: route.clientNavigation.reason,
    };
  }

  const navigationPage = await page.context().newPage();

  try {
    await configureEvidencePage(navigationPage);
    await installClientNavigationEvidenceMocks(navigationPage, route.setup);

    const sourceUrl = new URL(route.clientNavigation.sourceUrl, baseUrl);
    const targetUrl = new URL(route.url, baseUrl);
    const expectedFinalUrl = new URL(route.expected.finalPath, baseUrl);
    const sentinel = `migration-evidence-window:${route.id}`;
    const errors: string[] = [];

    const sourceTracker = new EvidenceTracker(navigationPage, normalize);
    sourceTracker.start();
    await navigationPage.goto(sourceUrl.href, {
      waitUntil: 'domcontentloaded',
    });
    await settleDocument(navigationPage);
    await sourceTracker.waitForQuiet();
    sourceTracker.stop();

    const observedSourceUrl = new URL(navigationPage.url());
    if (
      observedSourceUrl.pathname !== sourceUrl.pathname ||
      observedSourceUrl.search !== sourceUrl.search
    ) {
      errors.push(
        `Client navigation source ended at ${observedSourceUrl.pathname}${observedSourceUrl.search}`,
      );
    }

    await navigationPage.evaluate(
      ({ sentinelValue, targetHref }) => {
        type NavigationState = {
          sentinel: string;
          events: { type: string; url: string | null }[];
        };
        const state: NavigationState = {
          sentinel: sentinelValue,
          events: [],
        };
        const navigationWindow = window as typeof window & {
          __migrationEvidenceClientNavigation?: NavigationState;
        };
        navigationWindow.__migrationEvidenceClientNavigation = state;

        const record = (type: string, url: string | null = location.href) => {
          state.events.push({ type, url });
        };
        window.addEventListener('popstate', () => record('popstate'));
        window.addEventListener('hashchange', () => record('hashchange'));
        window.addEventListener('beforeunload', () => record('beforeunload'));
        window.addEventListener('pagehide', () => record('pagehide'));

        const anchor = document.createElement('a');
        anchor.dataset.migrationEvidenceTarget = 'true';
        anchor.href = targetHref;
        anchor.textContent = 'Migration evidence target';
        document.body.append(anchor);
      },
      { sentinelValue: sentinel, targetHref: targetUrl.href },
    );

    const tracker = new EvidenceTracker(navigationPage, normalize);
    tracker.start();
    let navigationError: string | null = null;
    let settleError: string | null = null;
    const interactionEvents: { type: string; url: string | null }[] = [];

    try {
      await navigationPage
        .locator('a[data-migration-evidence-target="true"]')
        .click();
      interactionEvents.push({
        type: 'anchor-click',
        url: normalizeEvidenceUrl(targetUrl.href, origins),
      });
      await navigationPage.waitForURL(
        (url) =>
          url.pathname === expectedFinalUrl.pathname &&
          url.search === expectedFinalUrl.search,
        { timeout: 5000 },
      );
    } catch (error) {
      navigationError = normalize(messageFor(error));
      errors.push(`Client navigation failed: ${navigationError}`);
    }

    try {
      await settleDocument(navigationPage);
      await tracker.waitForQuiet();
    } catch (error) {
      settleError = normalize(messageFor(error));
      errors.push(`Client navigation settlement failed: ${settleError}`);
    }

    const tracked = tracker.stop();
    const browserState = await navigationPage
      .evaluate(() => {
        const navigationWindow = window as typeof window & {
          __migrationEvidenceClientNavigation?: {
            sentinel: string;
            events: { type: string; url: string | null }[];
          };
        };
        return navigationWindow.__migrationEvidenceClientNavigation ?? null;
      })
      .catch(() => null);
    const navigationEvents = [
      ...interactionEvents,
      ...(browserState?.events ?? []).map((event) => ({
        ...event,
        url: event.url ? normalizeEvidenceUrl(event.url, origins) : null,
      })),
      ...tracked.mainFrameNavigations.map((url) => ({
        type: 'main-frame-navigated',
        url,
      })),
    ];
    const observedSentinel = browserState?.sentinel ?? null;
    const windowSentinel = {
      expected: sentinel,
      observed: observedSentinel,
      preserved: observedSentinel === sentinel,
    };
    const finalUrl = new URL(navigationPage.url());
    const has404Heading = await navigationPage
      .getByRole('heading', { level: 1, name: '404', exact: true })
      .isVisible()
      .catch(() => false);
    const observedAppStatus = has404Heading ? 404 : 200;
    const expectedAppStatus =
      route.expected.kind === 'not-found' ? route.expected.appStatus : 200;
    const usedCatchAllApis = [
      ...new Set(
        tracked.appApiRequests
          .map(({ mock }) => mock)
          .filter((mock): mock is string => mock !== null),
      ),
    ].sort();
    const unapprovedCatchAllApis = usedCatchAllApis.filter(
      (mock) =>
        !route.approvedCatchAllApis.includes(mock as EvidenceCatchAllApi),
    );
    const apiFailures = tracked.appApiRequests.filter(
      ({ failure, status }) =>
        (failure !== null && status === null) ||
        (status !== null && status >= 400),
    );
    const assessedConsoleErrors = tracked.consoleMessages
      .filter(({ type }) => type === 'error')
      .map((message) => ({
        ...message,
        classification: classifyKnownConsoleError(message.text),
      }));
    const unexpectedConsoleErrors = assessedConsoleErrors.filter(
      ({ classification }) =>
        classification === null ||
        !route.approvedConsoleErrors.includes(classification),
    );
    const pageErrorAssessment = assessPageErrors(tracked.pageErrors, route);

    if (finalUrl.pathname !== route.expected.finalPath) {
      errors.push(
        `Expected client navigation final path ${route.expected.finalPath}, received ${finalUrl.pathname}`,
      );
    }
    if (observedAppStatus !== expectedAppStatus) {
      errors.push(
        `Expected client navigation app status ${expectedAppStatus}, received ${observedAppStatus}`,
      );
    }
    if (
      windowSentinel.preserved !==
      route.clientNavigation.expectedWindowPreserved
    ) {
      errors.push(
        `Expected client navigation window preservation to be ${route.clientNavigation.expectedWindowPreserved}, received ${windowSentinel.preserved}`,
      );
    }
    if (!navigationEvents.some(({ type }) => type === 'anchor-click')) {
      errors.push('Client navigation did not record the injected anchor click');
    }
    if (pageErrorAssessment.unexpected.length) {
      errors.push(
        `Client navigation page errors: ${pageErrorAssessment.unexpected
          .map(({ text }) => text)
          .join(' | ')}`,
      );
    }
    if (unexpectedConsoleErrors.length) {
      errors.push(
        `Client navigation console errors: ${unexpectedConsoleErrors
          .map(({ text }) => text)
          .join(' | ')}`,
      );
    }
    if (apiFailures.length) {
      errors.push(
        `Client navigation API failures: ${apiFailures
          .map(
            ({ method, path: requestPath, status, failure }) =>
              `${method} ${requestPath} ${status ?? failure}`,
          )
          .join(' | ')}`,
      );
    }
    if (unapprovedCatchAllApis.length) {
      errors.push(
        `Client navigation unapproved catch-all APIs: ${unapprovedCatchAllApis.join(', ')}`,
      );
    }

    return {
      kind: 'collected' as const,
      sourceUrl: normalizeEvidenceUrl(observedSourceUrl.href, origins),
      targetUrl: normalizeEvidenceUrl(targetUrl.href, origins),
      finalUrl: normalizeEvidenceUrl(finalUrl.href, origins),
      expected: {
        finalPath: route.expected.finalPath,
        appStatus: expectedAppStatus,
        windowPreserved: route.clientNavigation.expectedWindowPreserved,
      },
      observed: {
        finalPath: finalUrl.pathname,
        appStatus: observedAppStatus,
      },
      navigationEvents,
      windowSentinel,
      navigationError,
      settleError,
      appApiRequests: tracked.appApiRequests,
      catchAllMocks: {
        used: usedCatchAllApis,
        unapproved: unapprovedCatchAllApis,
      },
      consoleMessages: tracked.consoleMessages,
      consoleMessagesForParity: consoleMessagesForParity(
        tracked.consoleMessages,
        classifyKnownConsoleError,
      ),
      unexpectedConsoleErrors,
      pageErrors: tracked.pageErrors,
      unexpectedPageErrors: pageErrorAssessment.unexpected,
      errors,
    };
  } finally {
    await navigationPage.close();
  }
};

const runFamilyScenario = async (
  page: Page,
  route: MigrationRoute,
  appOrigin: string,
  normalize: (value: string) => string,
) => {
  const familyScenario = migrationRouteFamilyScenarios[route.family];
  if (
    !('navigation' in familyScenario) ||
    familyScenario.routeId !== route.id
  ) {
    return null;
  }

  const errors: string[] = [];
  const { control, targetPath } = familyScenario.navigation;
  const locator = page
    .getByTestId(control.testId)
    .getByRole(control.role, {
      name: control.accessibleName,
      exact: true,
    })
    .filter({ visible: true })
    .first();
  const visible = await locator.isVisible();
  const tag = visible
    ? await locator.evaluate((element) => element.tagName)
    : '';
  const accessibleName = visible
    ? normalizeSemanticText(
        (await locator.getAttribute('aria-label')) ??
          (await locator.innerText()) ??
          '',
      )
    : '';

  if (!visible) errors.push(`Control ${control.testId} is not visible`);
  if (tag.toLowerCase() !== 'a') {
    errors.push(`Control ${control.testId} does not have link semantics`);
  }
  if (accessibleName !== control.accessibleName) {
    errors.push(
      `Control ${control.testId} accessible name was "${accessibleName}"`,
    );
  }

  if (visible) await locator.focus();
  const focused = visible
    ? await locator.evaluate((element) => document.activeElement === element)
    : false;
  if (!focused) errors.push(`Control ${control.testId} did not receive focus`);

  await installNavigationEvidenceMocks(page, targetPath);
  const tracker = new EvidenceTracker(page, normalize);
  tracker.start();
  let navigationError: string | null = null;

  if (visible) {
    try {
      await locator.click();
      await page.waitForURL((url) => url.pathname === targetPath, {
        timeout: 5000,
      });
      await tracker.waitForQuiet();
    } catch (error) {
      navigationError = normalize(messageFor(error));
      errors.push(`Client navigation failed: ${navigationError}`);
    }
  }

  const tracked = tracker.stop();
  const usedCatchAllApis = [
    ...new Set(
      tracked.appApiRequests
        .map(({ mock }) => mock)
        .filter((mock): mock is string => mock !== null),
    ),
  ].sort();
  const unapprovedCatchAllApis = usedCatchAllApis.filter(
    (mock) => !route.approvedCatchAllApis.includes(mock as EvidenceCatchAllApi),
  );
  const apiFailures = tracked.appApiRequests.filter(
    ({ failure, status }) =>
      (failure !== null && status === null) ||
      (status !== null && status >= 500),
  );
  const assessedConsoleErrors = tracked.consoleMessages
    .filter(({ type }) => type === 'error')
    .map((message) => ({
      ...message,
      classification: classifyKnownConsoleError(message.text),
    }));
  const unexpectedConsoleErrors = assessedConsoleErrors.filter(
    ({ classification }) =>
      classification === null ||
      !route.approvedConsoleErrors.includes(classification),
  );
  const pageErrorAssessment = assessPageErrors(tracked.pageErrors, route);

  if (pageErrorAssessment.unexpected.length) {
    errors.push(
      `Client navigation page errors: ${pageErrorAssessment.unexpected
        .map(({ text }) => text)
        .join(' | ')}`,
    );
  }
  if (unexpectedConsoleErrors.length) {
    errors.push(
      `Client navigation console errors: ${unexpectedConsoleErrors
        .map(({ text }) => text)
        .join(' | ')}`,
    );
  }
  if (apiFailures.length) {
    errors.push(
      `Client navigation API failures: ${apiFailures
        .map(
          ({ method, path: requestPath, status, failure }) =>
            `${method} ${requestPath} ${status ?? failure}`,
        )
        .join(' | ')}`,
    );
  }
  if (unapprovedCatchAllApis.length) {
    errors.push(
      `Client navigation unapproved catch-all APIs: ${unapprovedCatchAllApis.join(', ')}`,
    );
  }

  const finalPath = new URL(page.url()).pathname;
  if (finalPath !== targetPath) {
    errors.push(`Client navigation ended at ${finalPath}`);
  }

  return {
    control: {
      testId: control.testId,
      role: control.role,
      accessibleName,
      visible,
      focused,
    },
    targetPath,
    finalPath,
    navigationError,
    appApiRequests: tracked.appApiRequests,
    catchAllMocks: {
      used: usedCatchAllApis,
      unapproved: unapprovedCatchAllApis,
    },
    consoleMessages: tracked.consoleMessages,
    consoleMessagesForParity: consoleMessagesForParity(
      tracked.consoleMessages,
      classifyKnownConsoleError,
    ),
    consoleErrorAssessment: {
      observed: assessedConsoleErrors,
      unexpected: unexpectedConsoleErrors,
    },
    pageErrors: tracked.pageErrors,
    pageErrorAssessment,
    mainFrameNavigations: tracked.mainFrameNavigations,
    errors,
  };
};

const collectRoute = async (
  page: Page,
  route: MigrationRoute,
  variant: Variant,
) => {
  const baseUrl = variant === 'baseline' ? baselineUrl : candidateUrl;
  const appOrigin = new URL(baseUrl).origin;
  const normalize = (value: string) => normalizeEvidenceText(value, origins);

  await configureEvidencePage(page);
  await installEvidenceMocks(page, route.setup);

  const initialUrl = new URL(route.url, baseUrl).href;
  const serverResponse =
    route.expected.kind === 'server-response'
      ? await prepareServerResponse(page, initialUrl)
      : null;
  const tracker = new EvidenceTracker(page, normalize);
  tracker.start();
  let navigationResponse: Response | null = null;
  let navigationError: string | null = null;
  let settleError: string | null = null;

  try {
    navigationResponse = await page.goto(initialUrl, {
      waitUntil: 'domcontentloaded',
    });
  } catch (error) {
    navigationError = normalize(messageFor(error));
  }

  try {
    await settleDocument(page);
    await tracker.waitForQuiet();
  } catch (error) {
    settleError = normalize(messageFor(error));
  }

  const tracked = tracker.stop();
  const finalUrl = normalizeEvidenceUrl(page.url(), origins);
  const finalPath = new URL(page.url()).pathname;

  const routeDirectory = path.resolve(outputRoot, variant, 'routes', route.id);
  await mkdir(routeDirectory, { recursive: true });

  const screenshot = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
    quality: 80,
    type: 'jpeg',
  });
  const screenshotSample = await collectScreenshotSample(page, screenshot);
  let semantic:
    | Awaited<ReturnType<typeof collectSemanticPage>>
    | { collectionError: string };

  try {
    semantic = await collectSemanticPage(page);
  } catch (error) {
    semantic = {
      collectionError: normalize(messageFor(error)),
    };
  }

  let accessibility:
    | Awaited<ReturnType<typeof collectAccessibility>>
    | { collectionError: string };
  try {
    accessibility = await collectAccessibility(page);
  } catch (error) {
    accessibility = { collectionError: normalize(messageFor(error)) };
  }

  const scenario = await runFamilyScenario(page, route, appOrigin, normalize);
  const clientNavigation = await runClientNavigation(
    page,
    route,
    baseUrl,
    normalize,
  );
  const usedCatchAllApis = [
    ...new Set(
      tracked.appApiRequests
        .map(({ mock }) => mock)
        .filter((mock): mock is string => mock !== null),
    ),
  ].sort();
  const unapprovedCatchAllApis = usedCatchAllApis.filter(
    (mock) => !route.approvedCatchAllApis.includes(mock as EvidenceCatchAllApi),
  );
  const apiFailures = tracked.appApiRequests.filter(
    ({ failure, status }) =>
      (failure !== null && status === null) ||
      (status !== null && status >= 500),
  );
  const expectationFailures: string[] = [];

  if (navigationError) {
    expectationFailures.push(`Navigation error: ${navigationError}`);
  }
  if (settleError) {
    expectationFailures.push(`Settlement error: ${settleError}`);
  }
  if (navigationResponse?.status() !== route.expected.httpStatus) {
    expectationFailures.push(
      `Expected HTTP ${route.expected.httpStatus}, received ${
        navigationResponse?.status() ?? 'no response'
      }`,
    );
  }
  if (
    route.expected.kind === 'server-response' &&
    serverResponse?.classification !== 'rendered-markdown'
  ) {
    expectationFailures.push(
      `Expected rendered markdown, received ${
        serverResponse?.classification ?? 'no response'
      }`,
    );
  }
  if (finalPath !== route.expected.finalPath) {
    expectationFailures.push(
      `Expected final path ${route.expected.finalPath}, received ${finalPath}`,
    );
  }
  if (
    route.expected.kind === 'redirect' &&
    !tracked.mainFrameNavigations.some(
      (url) =>
        new URL(url.replace('<app-origin>', appOrigin)).pathname ===
        route.expected.finalPath,
    )
  ) {
    expectationFailures.push(
      `Expected client redirect to ${route.expected.finalPath}`,
    );
  }
  if (route.expected.kind === 'not-found') {
    const has404Heading =
      'headings' in semantic &&
      semantic.headings.some(
        ({ level, name }) => level === 1 && name.trim() === '404',
      );
    if (!has404Heading) {
      expectationFailures.push('Expected an accessible 404 heading');
    }
  }
  if ('collectionError' in semantic) {
    expectationFailures.push(
      `Semantic collection error: ${semantic.collectionError}`,
    );
  }
  if ('collectionError' in accessibility) {
    expectationFailures.push(
      `Accessibility collection error: ${accessibility.collectionError}`,
    );
  }
  const pageErrorAssessment = assessPageErrors(tracked.pageErrors, route);
  if (pageErrorAssessment.unexpected.length) {
    expectationFailures.push(
      `Page errors: ${pageErrorAssessment.unexpected
        .map(({ text }) => text)
        .join(' | ')}`,
    );
  }
  const consoleErrors = tracked.consoleMessages.filter(
    ({ type }) => type === 'error',
  );
  const assessedConsoleErrors = consoleErrors.map((message) => ({
    ...message,
    classification: classifyKnownConsoleError(message.text),
  }));
  const unexpectedConsoleErrors = assessedConsoleErrors.filter(
    ({ classification }) =>
      classification === null ||
      !route.approvedConsoleErrors.includes(classification),
  );
  if (unexpectedConsoleErrors.length) {
    expectationFailures.push(
      `Unexpected console errors: ${unexpectedConsoleErrors
        .map(({ text }) => text)
        .join(' | ')}`,
    );
  }
  if (apiFailures.length) {
    expectationFailures.push(
      `API failures: ${apiFailures
        .map(
          ({ method, path: requestPath, status, failure }) =>
            `${method} ${requestPath} ${status ?? failure}`,
        )
        .join(' | ')}`,
    );
  }
  if (unapprovedCatchAllApis.length) {
    expectationFailures.push(
      `Unapproved catch-all APIs: ${unapprovedCatchAllApis.join(', ')}`,
    );
  }
  if (scenario?.errors.length) {
    expectationFailures.push(...scenario.errors);
  }
  if (clientNavigation.kind === 'collected' && clientNavigation.errors.length) {
    expectationFailures.push(...clientNavigation.errors);
  }

  const evidence = {
    route: {
      id: route.id,
      source: route.source,
      routePattern: route.routePattern,
      family: route.family,
      setup: route.setup,
      expected: route.expected,
      availability: route.availability,
      approvedCatchAllApis: route.approvedCatchAllApis,
      approvedConsoleErrors: route.approvedConsoleErrors,
      approvedPageErrors: route.approvedPageErrors,
      clientNavigation: route.clientNavigation,
    },
    variant,
    initialUrl: normalizeEvidenceUrl(initialUrl, origins),
    finalUrl,
    serverResponse,
    navigation: {
      status: navigationResponse?.status() ?? null,
      statusText: navigationResponse?.statusText() ?? null,
      redirects: await navigationHops(navigationResponse),
      error: navigationError,
      settleError,
      mainFrameNavigations: tracked.mainFrameNavigations,
    },
    appApiRequests: tracked.appApiRequests,
    appApiRequestsForParity: apiRequestsForParity(tracked.appApiRequests),
    catchAllMocks: {
      used: usedCatchAllApis,
      unapproved: unapprovedCatchAllApis,
    },
    consoleMessages: tracked.consoleMessages,
    consoleErrorAssessment: {
      observed: assessedConsoleErrors,
      unexpected: unexpectedConsoleErrors,
    },
    pageErrors: tracked.pageErrors,
    pageErrorAssessment,
    unexpectedPageErrors: pageErrorAssessment.unexpected,
    semantic,
    accessibility,
    scenario,
    scenarioForParity: scenarioForParity(scenario),
    clientNavigation,
    clientNavigationForParity: clientNavigationForParity(clientNavigation),
    screenshot: {
      path: 'page.jpg',
      sha256: createHash('sha256').update(screenshot).digest('hex'),
      sample: screenshotSample,
    },
    expectationFailures,
  };

  await writeBufferExclusive(path.join(routeDirectory, 'page.jpg'), screenshot);
  await writeJsonExclusive(
    path.join(routeDirectory, 'evidence.json'),
    evidence,
  );

  return evidence;
};

test.describe('Vite migration A/B evidence', () => {
  for (const route of migrationRouteManifest) {
    test(`[${route.family}] collects ${route.id}`, async ({
      page,
    }, testInfo) => {
      const evidence = await collectRoute(
        page,
        route,
        testInfo.project.name as Variant,
      );

      expect(evidence.route.id).toBe(route.id);
      expect(evidence.expectationFailures).toEqual([]);
    });
  }
});

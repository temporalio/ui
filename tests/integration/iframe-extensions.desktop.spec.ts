import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { Frame, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import {
  ATTACKER_EXTENSION_ORIGIN,
  extensionFixtureState,
  installExtensionFixtureRoutes,
  PRIVILEGED_EXTENSION_ORIGIN,
  SAME_ORIGIN_FIXTURE_PATH,
} from '~/test-utilities/iframe-extension-fixture';
import { mockSettingsApi, mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

type RegistryExtension = {
  ID: string;
  Title: string;
  Slot: 'app.top-nav.sub-nav' | 'workflow.header.after-details';
  Src: string;
  AllowedOrigin: string;
  RoutePatterns: string[];
  Sandbox: {
    AllowDownloads: boolean;
    AllowForms: boolean;
    AllowModals: boolean;
    AllowPopups: boolean;
    AllowSameOrigin: boolean;
  };
  Sizing: {
    DefaultHeight: number;
    MinHeight: number;
    MaxHeight: number;
    DefaultWidth: number;
    MinWidth: number;
    MaxWidth: number;
  };
  Permissions: (
    | 'context:route'
    | 'context:namespace'
    | 'context:workflow'
    | 'navigation:write'
  )[];
};

type Registry = {
  Enabled: boolean;
  IframeExtensions: RegistryExtension[];
};

type HostObservedMessage = {
  origin: string;
  type?: string;
  extensionId?: string;
  instanceId?: string;
  height?: number;
};

const {
  workflowExecutionInfo: {
    execution: { workflowId, runId },
  },
} = mockWorkflow;
const workflowUrl = `/namespaces/default/workflows/${encodeURIComponent(
  workflowId,
)}/${runId}`;

const CUSTOM_UI_EXAMPLE_ORIGIN = 'https://custom-ui-extension.example.test';
const CUSTOM_UI_EXAMPLE_DIRECTORY = resolve(
  process.cwd(),
  'examples/custom-ui-extension',
);

const installCustomUIExampleRoutes = async (
  page: Page,
  temporalUIOrigin: string,
) => {
  const assets = new Map([
    ['/', { file: 'index.html', contentType: 'text/html; charset=utf-8' }],
    [
      '/index.html',
      { file: 'index.html', contentType: 'text/html; charset=utf-8' },
    ],
    [
      '/extension.js',
      { file: 'extension.js', contentType: 'text/javascript; charset=utf-8' },
    ],
    [
      '/style.css',
      { file: 'style.css', contentType: 'text/css; charset=utf-8' },
    ],
  ]);

  await page.route(`${CUSTOM_UI_EXAMPLE_ORIGIN}/**`, async (route) => {
    const asset = assets.get(new URL(route.request().url()).pathname);
    if (!asset) {
      await route.fulfill({ status: 404 });
      return;
    }

    let body = await readFile(
      resolve(CUSTOM_UI_EXAMPLE_DIRECTORY, asset.file),
      'utf8',
    );
    if (asset.file === 'index.html') {
      const configuredOrigin = 'content="http://localhost:3000"';
      if (!body.includes(configuredOrigin)) {
        throw new Error(
          'The custom UI example no longer contains its expected trust metadata',
        );
      }
      body = body.replace(configuredOrigin, `content="${temporalUIOrigin}"`);
    }

    await route.fulfill({
      body,
      contentType: asset.contentType,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Security-Policy': `default-src 'self'; frame-ancestors ${temporalUIOrigin}`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  });
};

const originForBaseURL = (baseURL: string | undefined): string => {
  if (!baseURL) {
    throw new Error('This test requires a configured Playwright baseURL');
  }
  return new URL(baseURL).origin;
};

const extension = (
  overrides: Partial<RegistryExtension> = {},
): RegistryExtension => ({
  ID: 'browser-extension',
  Title: 'Browser extension fixture',
  Slot: 'workflow.header.after-details',
  Src: `${PRIVILEGED_EXTENSION_ORIGIN}/extension.html?extensionId=browser-extension`,
  AllowedOrigin: PRIVILEGED_EXTENSION_ORIGIN,
  RoutePatterns: [],
  Sandbox: {
    AllowDownloads: false,
    AllowForms: false,
    AllowModals: false,
    AllowPopups: false,
    AllowSameOrigin: true,
  },
  Sizing: {
    DefaultHeight: 120,
    MinHeight: 100,
    MaxHeight: 240,
    DefaultWidth: 180,
    MinWidth: 100,
    MaxWidth: 360,
  },
  Permissions: [],
  ...overrides,
});

const observeHostMessages = async (page: Page) => {
  await page.addInitScript(() => {
    const messages: HostObservedMessage[] = [];
    Object.defineProperty(window, '__temporalExtensionTestMessages', {
      configurable: true,
      value: messages,
    });
    window.addEventListener('message', (event) => {
      const data =
        typeof event.data === 'object' && event.data !== null
          ? (event.data as Record<string, unknown>)
          : {};
      messages.push({
        origin: event.origin,
        type: typeof data.type === 'string' ? data.type : undefined,
        extensionId:
          typeof data.extensionId === 'string' ? data.extensionId : undefined,
        instanceId:
          typeof data.instanceId === 'string' ? data.instanceId : undefined,
        height: typeof data.height === 'number' ? data.height : undefined,
      });
    });
  });
};

const hostObservedMessages = async (
  page: Page,
): Promise<HostObservedMessage[]> => {
  return page.evaluate(() => {
    return (
      window as typeof window & {
        __temporalExtensionTestMessages: HostObservedMessage[];
      }
    ).__temporalExtensionTestMessages;
  });
};

const mockExtensionRegistry = async (page: Page, registry: Registry) => {
  await mockWorkflowApis(page, mockWorkflow);
  await mockSettingsApi(page, { CustomUI: registry } as unknown as NonNullable<
    Parameters<typeof mockSettingsApi>[1]
  >);
  await page.route('**/api/v1/ui-extensions**', async (route) => {
    await route.fulfill({ json: registry });
  });
};

const gotoWorkflow = async (page: Page, registry: Registry) => {
  await observeHostMessages(page);
  await installExtensionFixtureRoutes(page);
  await mockExtensionRegistry(page, registry);
  await page.goto(workflowUrl);
};

const extensionFrame = async (page: Page, title: string): Promise<Frame> => {
  const iframe = page.getByTitle(title);
  await expect(iframe).toBeVisible();
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  expect(frame).not.toBeNull();
  return frame as Frame;
};

const callFixture = async (
  frame: Frame,
  method: 'ready' | 'resize' | 'navigate',
  args: unknown[],
) => {
  await frame.evaluate(
    ({ method, args }) => {
      const fixture = (
        window as typeof window & {
          extensionFixture: Record<string, (...values: unknown[]) => void>;
        }
      ).extensionFixture;
      fixture[method](...args);
    },
    { method, args },
  );
};

const settleBrowserFrames = async (page: Page) => {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
};

test.describe('iframe extension browser boundary', () => {
  test('does not render empty slot wrappers when custom UI is disabled', async ({
    page,
  }) => {
    await gotoWorkflow(page, { Enabled: false, IframeExtensions: [] });

    await expect(page.locator('[data-temporal-extension-slot]')).toHaveCount(0);
  });

  test('fills the sub-navigation container when width is unset', async ({
    page,
  }) => {
    const fluidExtension = extension({
      ID: 'fluid-sub-nav',
      Title: 'Fluid sub-navigation extension',
      Slot: 'app.top-nav.sub-nav',
      Src: `${PRIVILEGED_EXTENSION_ORIGIN}/extension.html?extensionId=fluid-sub-nav&autoReady=true`,
      Sizing: {
        DefaultHeight: 120,
        MinHeight: 100,
        MaxHeight: 200,
        DefaultWidth: 0,
        MinWidth: 0,
        MaxWidth: 0,
      },
    });
    await gotoWorkflow(page, {
      Enabled: true,
      IframeExtensions: [fluidExtension],
    });
    await extensionFrame(page, fluidExtension.Title);

    const container = page.locator(
      `[data-temporal-extension-id="${fluidExtension.ID}"]`,
    );
    await expect(container).toHaveCSS('max-width', '100%');

    const { containerWidth, contentWidth } = await container.evaluate(
      (element) => ({
        containerWidth: element.getBoundingClientRect().width,
        contentWidth:
          document.querySelector<HTMLElement>('#content-wrapper')
            ?.clientWidth ?? 0,
      }),
    );
    expect(containerWidth).toBeGreaterThan(1200);
    expect(containerWidth).toBeCloseTo(contentWidth, 0);
  });

  test('executes the checked-in example in an opaque unprivileged sandbox', async ({
    page,
  }, testInfo) => {
    const temporalUIOrigin = originForBaseURL(testInfo.project.use.baseURL);
    await installCustomUIExampleRoutes(page, temporalUIOrigin);

    const opaqueExample = extension({
      ID: 'local-extension-example',
      Title: 'Opaque custom UI extension example',
      Slot: 'app.top-nav.sub-nav',
      Src: `${CUSTOM_UI_EXAMPLE_ORIGIN}/index.html`,
      AllowedOrigin: CUSTOM_UI_EXAMPLE_ORIGIN,
      Sandbox: {
        AllowDownloads: false,
        AllowForms: false,
        AllowModals: false,
        AllowPopups: false,
        AllowSameOrigin: false,
      },
      Sizing: {
        DefaultHeight: 112,
        MinHeight: 72,
        MaxHeight: 200,
        DefaultWidth: 0,
        MinWidth: 0,
        MaxWidth: 0,
      },
      Permissions: [],
    });
    await gotoWorkflow(page, {
      Enabled: true,
      IframeExtensions: [opaqueExample],
    });

    const frame = await extensionFrame(page, opaqueExample.Title);
    await expect(frame.locator('#connection-status')).toHaveText('Connected');
    await expect(frame.locator('#theme-value')).toHaveText(/^(light|dark)$/);
    await expect(frame.locator('#viewport-value')).toHaveText(/^\d+ × \d+ px$/);
    await expect(frame.locator('#context-value')).toHaveText(
      'No context permissions were granted.',
    );
    await expect(frame.locator('#navigate-button')).toBeDisabled();
    const resizeButton = frame.locator('#resize-button');
    const container = page.locator(
      `[data-temporal-extension-id="${opaqueExample.ID}"]`,
    );
    await expect(resizeButton).toBeEnabled();
    await expect(container).toHaveCSS('height', '112px');
    await resizeButton.click();
    await expect(container).toHaveCSS('height', '184px');
    await expect(page.getByTitle(opaqueExample.Title)).toHaveAttribute(
      'sandbox',
      'allow-scripts',
    );
    await expect
      .poll(async () =>
        (await hostObservedMessages(page)).some(
          (message) =>
            message.origin === 'null' &&
            message.type === 'temporal-extension/ready' &&
            message.extensionId === opaqueExample.ID,
        ),
      )
      .toBe(true);
  });

  test('executes the checked-in example with granted context and gated host actions', async ({
    page,
  }, testInfo) => {
    const temporalUIOrigin = originForBaseURL(testInfo.project.use.baseURL);
    await installCustomUIExampleRoutes(page, temporalUIOrigin);

    const exampleExtension = extension({
      ID: 'local-extension-example',
      Title: 'Local custom UI extension example',
      Src: `${CUSTOM_UI_EXAMPLE_ORIGIN}/index.html`,
      AllowedOrigin: CUSTOM_UI_EXAMPLE_ORIGIN,
      RoutePatterns: ['/namespaces/:namespace/workflows/:workflow/:run/*'],
      Sizing: {
        DefaultHeight: 112,
        MinHeight: 72,
        MaxHeight: 200,
        DefaultWidth: 0,
        MinWidth: 0,
        MaxWidth: 0,
      },
      Permissions: ['context:namespace', 'context:workflow'],
    });

    await gotoWorkflow(page, {
      Enabled: true,
      IframeExtensions: [exampleExtension],
    });

    const frame = await extensionFrame(page, exampleExtension.Title);
    await expect(frame.locator('#connection-status')).toHaveText('Connected');
    await expect(frame.locator('#connection-status')).toHaveAttribute(
      'data-state',
      'connected',
    );
    await expect(frame.locator('#theme-value')).toHaveText(/^(light|dark)$/);
    await expect(frame.locator('#viewport-value')).toHaveText(/^\d+ × \d+ px$/);
    await expect(frame.locator('#permission-value')).toHaveText(
      'Granted: context:namespace, context:workflow',
    );

    const renderedContext = frame.locator('#context-value');
    await expect(renderedContext).toContainText('"namespace": "default"');
    await expect(renderedContext).toContainText(workflowId);
    await expect(renderedContext).toContainText(runId);
    await expect(renderedContext).not.toContainText('"route"');

    await expect(frame.locator('#navigate-button')).toBeDisabled();
    const resizeButton = frame.locator('#resize-button');
    await expect(resizeButton).toBeEnabled();

    const container = page.locator(
      `[data-temporal-extension-id="${exampleExtension.ID}"]`,
    );
    await expect(container).toHaveCSS('height', '112px');
    await resizeButton.click();
    await expect(frame.locator('#context-panel')).toBeVisible();
    await expect(resizeButton).toHaveText('Hide context');
    await expect(container).toHaveCSS('height', '184px');
  });

  test('keeps an opaque same-origin frame unprivileged and preserves its sandbox in popups', async ({
    page,
  }) => {
    const opaqueExtension = extension({
      ID: 'opaque-extension',
      Title: 'Opaque extension fixture',
      Src: `${SAME_ORIGIN_FIXTURE_PATH}?extensionId=opaque-extension&autoReady=true`,
      AllowedOrigin: 'self',
      Sandbox: {
        AllowDownloads: false,
        AllowForms: false,
        AllowModals: false,
        AllowPopups: true,
        AllowSameOrigin: false,
      },
      Permissions: [],
    });
    await gotoWorkflow(page, {
      Enabled: true,
      IframeExtensions: [opaqueExtension],
    });

    const frame = await extensionFrame(page, opaqueExtension.Title);
    await expect
      .poll(async () => (await extensionFixtureState(frame)).instanceId)
      .toBeTruthy();
    await expect
      .poll(async () =>
        (await extensionFixtureState(frame)).received.some(
          ({ data }) => data.type === 'temporal-ui/theme',
        ),
      )
      .toBe(true);

    const state = await extensionFixtureState(frame);
    expect(state.parentDomReadable).toBe(false);
    expect(state.storageReadable).toBe(false);
    expect(
      state.received.some(({ data }) => data.type === 'temporal-ui/context'),
    ).toBe(false);
    expect(
      state.received.find(({ data }) => data.type === 'temporal-ui/welcome')
        ?.data.permissions,
    ).toEqual([]);

    const iframe = page.getByTitle(opaqueExtension.Title);
    await expect(iframe).toHaveAttribute('sandbox', /allow-popups/);
    await expect(iframe).not.toHaveAttribute(
      'sandbox',
      /allow-popups-to-escape-sandbox/,
    );
    expect(
      await iframe.evaluate((element: HTMLIFrameElement) => {
        try {
          return element.contentDocument?.body != null;
        } catch {
          return false;
        }
      }),
    ).toBe(false);

    await expect
      .poll(async () =>
        (await hostObservedMessages(page)).some(
          (message) =>
            message.origin === 'null' &&
            message.type === 'temporal-extension/ready' &&
            message.extensionId === opaqueExtension.ID,
        ),
      )
      .toBe(true);

    const popupPromise = page.context().waitForEvent('page');
    await frame.getByTestId('open-popup').click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    expect(
      await popup.evaluate(() => {
        try {
          localStorage.setItem('popup-sandbox-check', '1');
          localStorage.removeItem('popup-sandbox-check');
          return true;
        } catch {
          return false;
        }
      }),
    ).toBe(false);
    await popup.close();
  });

  test('requires a valid HTTPS handshake before sharing context or honoring commands', async ({
    page,
  }) => {
    const privilegedExtension = extension({
      Permissions: [
        'context:route',
        'context:namespace',
        'context:workflow',
        'navigation:write',
      ],
    });
    await gotoWorkflow(page, {
      Enabled: true,
      IframeExtensions: [privilegedExtension],
    });

    const frame = await extensionFrame(page, privilegedExtension.Title);
    await expect
      .poll(async () => (await extensionFixtureState(frame)).instanceId)
      .toBeTruthy();
    const beforeReady = await extensionFixtureState(frame);
    const welcome = beforeReady.received.find(
      ({ data }) => data.type === 'temporal-ui/welcome',
    );
    expect(welcome?.data.permissions).toEqual(privilegedExtension.Permissions);
    expect(
      beforeReady.received.some(
        ({ data }) => data.type === 'temporal-ui/context',
      ),
    ).toBe(false);

    const container = page.locator(
      `[data-temporal-extension-id="${privilegedExtension.ID}"]`,
    );
    await expect(container).toHaveCSS('height', '120px');
    await callFixture(frame, 'resize', [220]);
    await settleBrowserFrames(page);
    await expect(container).toHaveCSS('height', '120px');

    await callFixture(frame, 'ready', []);
    await expect
      .poll(async () =>
        (await extensionFixtureState(frame)).received.find(
          ({ data }) => data.type === 'temporal-ui/context',
        ),
      )
      .toBeTruthy();

    const readyState = await extensionFixtureState(frame);
    const contextMessage = readyState.received.find(
      ({ data }) => data.type === 'temporal-ui/context',
    );
    expect(
      readyState.received.filter(
        ({ data }) => data.type === 'temporal-ui/context',
      ),
    ).toHaveLength(1);
    expect(contextMessage?.data.instanceId).toBe(readyState.instanceId);
    expect(contextMessage?.data.context).toMatchObject({
      namespace: 'default',
      route: { pathname: new URL(page.url()).pathname },
      workflow: { workflowId, runId },
    });
    expect(readyState.received[0]?.data.type).toBe('temporal-ui/welcome');

    await expect
      .poll(async () =>
        (await hostObservedMessages(page)).some(
          (message) =>
            message.origin === PRIVILEGED_EXTENSION_ORIGIN &&
            message.type === 'temporal-extension/ready' &&
            message.extensionId === privilegedExtension.ID,
        ),
      )
      .toBe(true);

    await callFixture(frame, 'resize', [
      220,
      undefined,
      { extensionId: 'wrong' },
    ]);
    await callFixture(frame, 'resize', [
      220,
      undefined,
      { instanceId: 'wrong' },
    ]);

    const attackerURL = new URL('/attacker.html', PRIVILEGED_EXTENSION_ORIGIN);
    attackerURL.searchParams.set('attackExtensionId', privilegedExtension.ID);
    attackerURL.searchParams.set(
      'attackInstanceId',
      readyState.instanceId ?? '',
    );
    attackerURL.searchParams.set('attackHeight', '220');
    await page.evaluate((src) => {
      const attacker = document.createElement('iframe');
      attacker.dataset.testid = 'extension-source-attacker';
      attacker.src = src;
      document.body.append(attacker);
    }, attackerURL.href);
    await expect
      .poll(async () =>
        (await hostObservedMessages(page)).some(
          (message) =>
            message.origin === PRIVILEGED_EXTENSION_ORIGIN &&
            message.type === 'temporal-extension/resize' &&
            message.height === 220,
        ),
      )
      .toBe(true);
    await expect(container).toHaveCSS('height', '120px');

    await callFixture(frame, 'resize', [200]);
    await callFixture(frame, 'resize', [undefined, 300]);
    await settleBrowserFrames(page);
    await expect(container).toHaveCSS('height', '200px');
    await expect(container).toHaveCSS('width', '300px');

    await callFixture(frame, 'resize', [1_000, 1_000]);
    await expect(container).toHaveCSS('height', '240px');
    await expect(container).toHaveCSS('width', '360px');

    const originalURL = page.url();
    await callFixture(frame, 'navigate', ['https://attacker.example.test/']);
    await callFixture(frame, 'navigate', ['/admin']);
    await callFixture(frame, 'navigate', [
      '/namespaces/default/workflows',
      { instanceId: 'wrong' },
    ]);
    await settleBrowserFrames(page);
    expect(page.url()).toBe(originalURL);

    await callFixture(frame, 'navigate', [
      '/namespaces/default/workflows?from=extension#accepted',
    ]);
    await expect(page).toHaveURL(
      /\/namespaces\/default\/workflows\?from=extension#accepted$/,
    );
  });

  test('does not deliver privileged state after redirect or hostile self-navigation', async ({
    page,
  }) => {
    const redirectedExtension = extension({
      ID: 'redirected-extension',
      Title: 'Redirected extension fixture',
      Src: `${PRIVILEGED_EXTENSION_ORIGIN}/redirect`,
      Permissions: ['context:route'],
    });
    await gotoWorkflow(page, {
      Enabled: true,
      IframeExtensions: [redirectedExtension],
    });

    const redirectedFrame = await extensionFrame(
      page,
      redirectedExtension.Title,
    );
    await expect
      .poll(() => redirectedFrame.url())
      .toContain(ATTACKER_EXTENSION_ORIGIN);
    await settleBrowserFrames(page);
    const redirectedState = await extensionFixtureState(redirectedFrame);
    expect(redirectedState.received).toEqual([]);
    expect(redirectedState.instanceId).toBeUndefined();

    const selfNavigatingExtension = extension({
      ID: 'self-navigating-extension',
      Title: 'Self navigating extension fixture',
      Src: `${PRIVILEGED_EXTENSION_ORIGIN}/extension.html?extensionId=self-navigating-extension&autoReady=true`,
      Permissions: ['context:route'],
    });
    await page.unroute('**/api/v1/ui-extensions**');
    await page.route('**/api/v1/ui-extensions**', async (route) => {
      await route.fulfill({
        json: { Enabled: true, IframeExtensions: [selfNavigatingExtension] },
      });
    });
    await mockSettingsApi(page, {
      CustomUI: {
        Enabled: true,
        IframeExtensions: [selfNavigatingExtension],
      },
    } as unknown as NonNullable<Parameters<typeof mockSettingsApi>[1]>);
    await page.reload();

    const selfNavigatingFrame = await extensionFrame(
      page,
      selfNavigatingExtension.Title,
    );
    await expect
      .poll(async () =>
        (await extensionFixtureState(selfNavigatingFrame)).received.some(
          ({ data }) => data.type === 'temporal-ui/context',
        ),
      )
      .toBe(true);
    const trustedState = await extensionFixtureState(selfNavigatingFrame);
    const container = page.locator(
      `[data-temporal-extension-id="${selfNavigatingExtension.ID}"]`,
    );
    await expect(container).toHaveCSS('height', '120px');
    await callFixture(selfNavigatingFrame, 'resize', [220]);
    await expect(container).toHaveCSS('height', '220px');

    const sameOriginReloadURL = new URL(
      '/same-origin-reload',
      PRIVILEGED_EXTENSION_ORIGIN,
    );
    sameOriginReloadURL.searchParams.set(
      'attackExtensionId',
      selfNavigatingExtension.ID,
    );
    sameOriginReloadURL.searchParams.set(
      'attackInstanceId',
      trustedState.instanceId ?? '',
    );
    sameOriginReloadURL.searchParams.set('attackHeight', '220');
    await selfNavigatingFrame.evaluate((href) => {
      window.location.href = href;
    }, sameOriginReloadURL.href);

    await expect
      .poll(() => selfNavigatingFrame.url())
      .toContain('/same-origin-reload');
    await expect
      .poll(async () => {
        const nextInstanceId = (
          await extensionFixtureState(selfNavigatingFrame)
        ).instanceId;
        return nextInstanceId && nextInstanceId !== trustedState.instanceId
          ? nextInstanceId
          : null;
      })
      .toBeTruthy();
    await expect(container).toHaveCSS('height', '120px');

    const reloadedState = await extensionFixtureState(selfNavigatingFrame);
    expect(
      reloadedState.received.some(
        ({ data }) => data.type === 'temporal-ui/context',
      ),
    ).toBe(false);
    await callFixture(selfNavigatingFrame, 'ready', []);
    await expect
      .poll(async () =>
        (await extensionFixtureState(selfNavigatingFrame)).received.some(
          ({ data }) => data.type === 'temporal-ui/context',
        ),
      )
      .toBe(true);

    const hostileURL = new URL(
      '/self-navigation-receiver',
      ATTACKER_EXTENSION_ORIGIN,
    );
    hostileURL.searchParams.set(
      'attackExtensionId',
      selfNavigatingExtension.ID,
    );
    hostileURL.searchParams.set(
      'attackInstanceId',
      reloadedState.instanceId ?? '',
    );
    hostileURL.searchParams.set('attackHeight', '220');
    await selfNavigatingFrame.evaluate((href) => {
      window.location.href = href;
    }, hostileURL.href);

    await expect
      .poll(() => selfNavigatingFrame.url())
      .toContain(ATTACKER_EXTENSION_ORIGIN);
    await expect
      .poll(async () =>
        (await hostObservedMessages(page)).some(
          (message) =>
            message.origin === ATTACKER_EXTENSION_ORIGIN &&
            message.type === 'temporal-extension/resize' &&
            message.height === 220,
        ),
      )
      .toBe(true);
    const hostileState = await extensionFixtureState(selfNavigatingFrame);
    expect(hostileState.received).toEqual([]);
    await expect(container).toHaveCSS('height', '120px');
  });
});

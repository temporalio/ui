import type { Frame, Page, Route } from '@playwright/test';

export const PRIVILEGED_EXTENSION_ORIGIN =
  'https://temporal-extension.example.test';
export const ATTACKER_EXTENSION_ORIGIN =
  'https://temporal-extension-attacker.example.test';
export const SAME_ORIGIN_FIXTURE_PATH = '/iframe-fixtures/extension.html';

type ExtensionFixtureOptions = {
  autoReady?: boolean;
  attack?: {
    extensionId: string;
    instanceId: string;
    height: number;
  };
};

const html = (options: ExtensionFixtureOptions = {}) => {
  const autoReady = options.autoReady ?? false;
  const attack = options.attack ?? null;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Temporal extension browser fixture</title>
  </head>
  <body>
    <p data-testid="fixture-state">loading</p>
    <button data-testid="open-popup" type="button">Open popup</button>
    <script>
      (() => {
        const autoReady = ${JSON.stringify(autoReady)};
        const attack = ${JSON.stringify(attack)};
        const query = new URLSearchParams(location.search);
        const extensionId = query.get('extensionId') || 'browser-extension';
        const state = {
          extensionId,
          instanceId: undefined,
          version: 1,
          received: [],
          parentDomReadable: false,
          storageReadable: false,
        };

        try {
          void window.parent.document.body;
          state.parentDomReadable = true;
        } catch {}

        try {
          localStorage.setItem('temporal-extension-fixture', '1');
          localStorage.removeItem('temporal-extension-fixture');
          state.storageReadable = true;
        } catch {}

        const render = () => {
          document.querySelector('[data-testid="fixture-state"]').textContent =
            JSON.stringify(state);
        };

        const post = (type, values = {}, overrides = {}) => {
          window.parent.postMessage(
            {
              type,
              version: state.version,
              extensionId: state.extensionId,
              instanceId: state.instanceId,
              ...values,
              ...overrides,
            },
            '*',
          );
        };

        const ready = (overrides = {}) => {
          post('temporal-extension/ready', {}, overrides);
        };

        window.extensionFixture = {
          state,
          ready,
          resize: (height, width, overrides = {}) =>
            post(
              'temporal-extension/resize',
              { height, ...(width == null ? {} : { width }) },
              overrides,
            ),
          navigate: (href, overrides = {}) =>
            post('temporal-extension/navigate', { href }, overrides),
        };

        window.addEventListener('message', (event) => {
          state.received.push({ origin: event.origin, data: event.data });

          if (event.data?.type === 'temporal-ui/welcome') {
            state.instanceId = event.data.instanceId;
            state.version = event.data.version;
            if (autoReady) ready();
          }

          render();
        });

        document
          .querySelector('[data-testid="open-popup"]')
          .addEventListener('click', () => {
            window.open(
              '${SAME_ORIGIN_FIXTURE_PATH}?extensionId=popup',
              'temporal-extension-popup',
            );
          });

        if (attack) {
          state.extensionId = attack.extensionId;
          state.instanceId = attack.instanceId;
          setTimeout(() => {
            post(
              'temporal-extension/resize',
              { height: attack.height },
              {
                extensionId: attack.extensionId,
                instanceId: attack.instanceId,
              },
            );
          }, 0);
        }

        render();
      })();
    </script>
  </body>
</html>`;
};

const fulfillHtml = async (route: Route, options?: ExtensionFixtureOptions) => {
  await route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: html(options),
  });
};

export const installExtensionFixtureRoutes = async (page: Page) => {
  await page.route(`${PRIVILEGED_EXTENSION_ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === '/redirect') {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: `<!doctype html><meta http-equiv="refresh" content="0;url=${ATTACKER_EXTENSION_ORIGIN}/redirect-receiver">`,
      });
      return;
    }

    const autoReady = url.searchParams.get('autoReady') === 'true';
    const attackInstanceId = url.searchParams.get('attackInstanceId');
    const attackExtensionId = url.searchParams.get('attackExtensionId');
    const attackHeight = Number(url.searchParams.get('attackHeight'));

    await fulfillHtml(route, {
      autoReady,
      ...(attackInstanceId && attackExtensionId && Number.isFinite(attackHeight)
        ? {
            attack: {
              extensionId: attackExtensionId,
              instanceId: attackInstanceId,
              height: attackHeight,
            },
          }
        : {}),
    });
  });

  await page.route(`${ATTACKER_EXTENSION_ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());
    const attackInstanceId = url.searchParams.get('attackInstanceId');
    const attackExtensionId = url.searchParams.get('attackExtensionId');
    const attackHeight = Number(url.searchParams.get('attackHeight'));

    await fulfillHtml(route, {
      ...(attackInstanceId && attackExtensionId && Number.isFinite(attackHeight)
        ? {
            attack: {
              extensionId: attackExtensionId,
              instanceId: attackInstanceId,
              height: attackHeight,
            },
          }
        : {}),
    });
  });

  await page.route(`**${SAME_ORIGIN_FIXTURE_PATH}**`, async (route) => {
    const url = new URL(route.request().url());
    await fulfillHtml(route, {
      autoReady: url.searchParams.get('autoReady') === 'true',
    });
  });
};

export type ExtensionFixtureState = {
  extensionId: string;
  instanceId?: string;
  version: number;
  received: {
    origin: string;
    data: Record<string, unknown>;
  }[];
  parentDomReadable: boolean;
  storageReadable: boolean;
};

export const extensionFixtureState = async (
  frame: Frame,
): Promise<ExtensionFixtureState> => {
  return frame.evaluate(() => {
    return (
      window as typeof window & {
        extensionFixture: { state: ExtensionFixtureState };
      }
    ).extensionFixture.state;
  });
};

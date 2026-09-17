import { describe, expect, it } from 'vitest';

import {
  createContextMessage,
  createThemeMessage,
  createViewportMessage,
  createWelcomeMessage,
  parseExtensionMessage,
} from './messages';

const instanceId = '165daa7f-f540-4878-bd28-3b7c9b9f78c8';

describe('parseExtensionMessage', () => {
  it('parses hello without an instance and ready with an instance', () => {
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/hello',
        version: 1,
        extensionId: 'top-nav-status',
      }),
    ).toEqual({
      type: 'temporal-extension/hello',
      version: 1,
      extensionId: 'top-nav-status',
    });
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/ready',
        version: 1,
        extensionId: 'top-nav-status',
        instanceId,
      }),
    ).toEqual({
      type: 'temporal-extension/ready',
      version: 1,
      extensionId: 'top-nav-status',
      instanceId,
    });
  });

  it('parses resize messages with finite dimensions', () => {
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/resize',
        version: 1,
        extensionId: 'top-nav-status',
        instanceId,
        width: 220,
        height: 32,
      }),
    ).toEqual({
      type: 'temporal-extension/resize',
      version: 1,
      extensionId: 'top-nav-status',
      instanceId,
      width: 220,
      height: 32,
    });
  });

  it('drops malformed, stale-protocol, and unbounded messages', () => {
    expect(parseExtensionMessage(null)).toBeNull();
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/ready',
        version: 2,
        extensionId: 'top-nav-status',
        instanceId,
      }),
    ).toBeNull();
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/ready',
        version: 1,
        extensionId: 'top-nav-status',
      }),
    ).toBeNull();
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/resize',
        version: 1,
        extensionId: 'top-nav-status',
        instanceId,
        height: Number.POSITIVE_INFINITY,
      }),
    ).toBeNull();
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/hello',
        version: 1,
        extensionId: 'x'.repeat(129),
      }),
    ).toBeNull();
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/navigate',
        version: 1,
        extensionId: 'top-nav-status',
        instanceId,
        href: `/${'x'.repeat(2048)}`,
      }),
    ).toBeNull();
  });

  it('parses bounded navigate messages', () => {
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/navigate',
        version: 1,
        extensionId: 'workflow-header-summary',
        instanceId,
        href: '/namespaces/default',
      }),
    ).toEqual({
      type: 'temporal-extension/navigate',
      version: 1,
      extensionId: 'workflow-header-summary',
      instanceId,
      href: '/namespaces/default',
    });
  });
});

describe('host messages', () => {
  it('creates welcome messages with the effective permissions', () => {
    expect(
      createWelcomeMessage('workflow-header-summary', instanceId, [
        'context:workflow',
      ]),
    ).toEqual({
      type: 'temporal-ui/welcome',
      version: 1,
      extensionId: 'workflow-header-summary',
      instanceId,
      permissions: ['context:workflow'],
    });
  });

  it('creates instance-bound context messages', () => {
    expect(
      createContextMessage('workflow-header-summary', instanceId, {
        uiVersion: '2.51.0',
        basePath: '',
        route: {
          pathname: '/namespaces/default',
          search: '',
          params: { namespace: 'default' },
        },
      }),
    ).toEqual({
      type: 'temporal-ui/context',
      version: 1,
      extensionId: 'workflow-header-summary',
      instanceId,
      context: {
        uiVersion: '2.51.0',
        basePath: '',
        route: {
          pathname: '/namespaces/default',
          search: '',
          params: { namespace: 'default' },
        },
      },
    });
  });

  it('creates instance-bound theme and viewport messages', () => {
    expect(createThemeMessage('top-nav-status', instanceId, 'dark')).toEqual({
      type: 'temporal-ui/theme',
      version: 1,
      extensionId: 'top-nav-status',
      instanceId,
      theme: 'dark',
    });
    expect(
      createViewportMessage(
        'top-nav-status',
        instanceId,
        'app.top-nav.actions.after',
        160,
        32,
      ),
    ).toEqual({
      type: 'temporal-ui/viewport',
      version: 1,
      extensionId: 'top-nav-status',
      instanceId,
      slot: 'app.top-nav.actions.after',
      width: 160,
      height: 32,
    });
  });
});

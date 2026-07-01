import { describe, expect, it } from 'vitest';

import {
  createContextMessage,
  createThemeMessage,
  parseExtensionMessage,
} from './messages';

describe('parseExtensionMessage', () => {
  it('parses ready messages', () => {
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/ready',
        version: 1,
        extensionId: 'top-nav-status',
      }),
    ).toEqual({
      type: 'temporal-extension/ready',
      version: 1,
      extensionId: 'top-nav-status',
    });
  });

  it('parses resize messages with finite dimensions', () => {
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/resize',
        version: 1,
        extensionId: 'top-nav-status',
        width: 220,
        height: 32,
      }),
    ).toEqual({
      type: 'temporal-extension/resize',
      version: 1,
      extensionId: 'top-nav-status',
      width: 220,
      height: 32,
    });
  });

  it('drops malformed messages', () => {
    expect(parseExtensionMessage(null)).toBeNull();
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/ready',
        version: 2,
        extensionId: 'top-nav-status',
      }),
    ).toBeNull();
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/resize',
        version: 1,
        extensionId: 'top-nav-status',
        height: Number.POSITIVE_INFINITY,
      }),
    ).toBeNull();
  });

  it('parses navigate messages', () => {
    expect(
      parseExtensionMessage({
        type: 'temporal-extension/navigate',
        version: 1,
        extensionId: 'workflow-header-summary',
        href: '/namespaces/default',
      }),
    ).toEqual({
      type: 'temporal-extension/navigate',
      version: 1,
      extensionId: 'workflow-header-summary',
      href: '/namespaces/default',
    });
  });
});

describe('host messages', () => {
  it('creates context messages', () => {
    expect(
      createContextMessage('workflow-header-summary', {
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

  it('creates theme messages', () => {
    expect(createThemeMessage('top-nav-status', 'dark')).toEqual({
      type: 'temporal-ui/theme',
      version: 1,
      extensionId: 'top-nav-status',
      theme: 'dark',
    });
  });
});

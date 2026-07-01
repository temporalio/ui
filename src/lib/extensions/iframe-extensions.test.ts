import { describe, expect, it } from 'vitest';

import type { IframeExtension } from '$lib/types/global';

import {
  buildIframeSandbox,
  clampHeight,
  extensionMatchesRoute,
  initialHeight,
  initialWidth,
  isIframeExtensionAllowed,
  permittedContext,
  resolveAllowedOrigin,
  safeNavigationPath,
} from './iframe-extensions';

const currentOrigin = 'https://temporal.example.com';

const extension = (
  overrides: Partial<IframeExtension> = {},
): IframeExtension => ({
  id: 'test-extension',
  title: 'Test extension',
  slot: 'workflow.header.after-details',
  src: '/custom-ui-examples/workflow-header.html',
  allowedOrigin: 'self',
  routePatterns: [],
  sandbox: {
    allowDownloads: false,
    allowForms: false,
    allowModals: false,
    allowPopups: false,
    allowPopupsToEscapeSandbox: false,
    allowSameOrigin: false,
  },
  sizing: {},
  permissions: [],
  ...overrides,
});

describe('iframe extension validation', () => {
  it('resolves self to the current origin', () => {
    expect(resolveAllowedOrigin('self', currentOrigin)).toBe(currentOrigin);
  });

  it('rejects wildcard and insecure remote origins', () => {
    expect(resolveAllowedOrigin('*', currentOrigin)).toBeNull();
    expect(
      resolveAllowedOrigin('http://example.com', currentOrigin),
    ).toBeNull();
  });

  it('allows https and localhost origins', () => {
    expect(
      resolveAllowedOrigin('https://example.com/path', currentOrigin),
    ).toBe('https://example.com');
    expect(resolveAllowedOrigin('http://localhost:3000', currentOrigin)).toBe(
      'http://localhost:3000',
    );
  });

  it('allows a relative src when allowedOrigin is self', () => {
    expect(isIframeExtensionAllowed(extension(), currentOrigin)).toBe(true);
  });

  it('rejects src origins that do not match allowedOrigin', () => {
    expect(
      isIframeExtensionAllowed(
        extension({
          src: 'https://evil.example.com/panel.html',
          allowedOrigin: 'https://extensions.example.com',
        }),
        currentOrigin,
      ),
    ).toBe(false);
  });
});

describe('extension route matching', () => {
  it('matches all routes when no route patterns are configured', () => {
    expect(extensionMatchesRoute(extension(), '/anything')).toBe(true);
  });

  it('matches configured workflow route patterns', () => {
    expect(
      extensionMatchesRoute(
        extension({
          routePatterns: ['/namespaces/:namespace/workflows/:workflow/:run/*'],
        }),
        '/namespaces/default/workflows/order-workflow/run-1/timeline',
      ),
    ).toBe(true);
  });

  it('matches configured workflow route patterns with encoded path params', () => {
    expect(
      extensionMatchesRoute(
        extension({
          routePatterns: ['/namespaces/:namespace/workflows/:workflow/:run/*'],
        }),
        '/namespaces/default/workflows/order%2Fworkflow/run-id/timeline',
      ),
    ).toBe(true);
  });

  it('matches base workflow routes for trailing wildcard route patterns', () => {
    expect(
      extensionMatchesRoute(
        extension({
          routePatterns: ['/namespaces/:namespace/workflows/:workflow/:run/*'],
        }),
        '/namespaces/default/workflows/order-workflow/run-1',
      ),
    ).toBe(true);
  });

  it('ignores invalid route patterns', () => {
    expect(
      extensionMatchesRoute(
        extension({
          routePatterns: ['(/invalid'],
        }),
        '/namespaces/default/workflows/order-workflow/run-1/timeline',
      ),
    ).toBe(false);
  });
});

describe('iframe sandbox and sizing', () => {
  it('uses allow-scripts as the default sandbox', () => {
    expect(buildIframeSandbox(extension().sandbox)).toBe('allow-scripts');
  });

  it('adds only configured sandbox permissions', () => {
    expect(
      buildIframeSandbox({
        ...extension().sandbox,
        allowForms: true,
        allowPopupsToEscapeSandbox: true,
      }),
    ).toBe(
      'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox',
    );
  });

  it('clamps resize heights to configured bounds', () => {
    expect(clampHeight(2000, { minHeight: 100, maxHeight: 400 })).toBe(400);
    expect(clampHeight(20, { minHeight: 100, maxHeight: 400 })).toBe(100);
  });

  it('treats zero sizing values as unset defaults', () => {
    expect(
      initialWidth({
        defaultWidth: 0,
        minWidth: 0,
        maxWidth: 0,
      }),
    ).toBeUndefined();
    expect(
      initialHeight({
        defaultHeight: 0,
        minHeight: 0,
        maxHeight: 0,
      }),
    ).toBe(160);
  });
});

describe('extension context and navigation', () => {
  it('strips workflow context unless the extension has permission', () => {
    const context = {
      uiVersion: '2.51.0',
      basePath: '',
      route: {
        pathname: '/namespaces/default/workflows',
        search: '',
        params: { namespace: 'default' },
      },
      namespace: 'default',
      workflow: {
        workflowId: 'order-workflow',
        runId: 'run-1',
      },
    };

    expect(permittedContext(context, [])).not.toHaveProperty('workflow');
    expect(permittedContext(context, ['context:workflow'])).toHaveProperty(
      'workflow',
    );
  });

  it('allows only same-origin navigation paths', () => {
    expect(safeNavigationPath('/namespaces/default', currentOrigin)).toBe(
      '/namespaces/default',
    );
    expect(
      safeNavigationPath(
        'https://other.example.com/namespaces/default',
        currentOrigin,
      ),
    ).toBeNull();
    expect(safeNavigationPath('javascript:alert(1)', currentOrigin)).toBeNull();
  });
});

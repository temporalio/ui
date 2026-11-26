import { describe, expect, it } from 'vitest';

import type { IframeExtension } from '$lib/types/global';

import {
  buildIframeSandbox,
  clampHeight,
  constrainSizingToSlot,
  effectiveAllowSameOrigin,
  extensionMatchesRoute,
  extensionsForSlot,
  initialHeight,
  initialWidth,
  isIframeExtensionAllowed,
  permittedContext,
  resolveAllowedOrigin,
  resolveExtensionSrc,
  safeNavigationPath,
} from './iframe-extensions';

const currentOrigin = 'https://temporal.example.com';

const extension = (
  overrides: Partial<IframeExtension> = {},
): IframeExtension => ({
  id: 'test-extension',
  title: 'Test extension',
  slot: 'workflow.header.after-details',
  src: '/extensions/workflow-header.html',
  allowedOrigin: 'self',
  routePatterns: [],
  sandbox: {
    allowDownloads: false,
    allowForms: false,
    allowModals: false,
    allowPopups: false,
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

  it('allows exact https and localhost origins', () => {
    expect(resolveAllowedOrigin('https://example.com/', currentOrigin)).toBe(
      'https://example.com',
    );
    expect(resolveAllowedOrigin('http://localhost:3000', currentOrigin)).toBe(
      'http://localhost:3000',
    );
    expect(resolveAllowedOrigin('http://127.0.0.2:3000', currentOrigin)).toBe(
      'http://127.0.0.2:3000',
    );
    expect(
      resolveAllowedOrigin('https://example.com/path', currentOrigin),
    ).toBeNull();
    expect(
      resolveAllowedOrigin('https://user@example.com', currentOrigin),
    ).toBeNull();
  });

  it('resolves local sources within the configured UI base path', () => {
    expect(
      resolveExtensionSrc('/custom-ui/panel.html', currentOrigin, '/temporal')
        ?.href,
    ).toBe('https://temporal.example.com/temporal/custom-ui/panel.html');
    expect(
      resolveExtensionSrc(
        '/temporal/custom-ui/panel.html',
        currentOrigin,
        '/temporal',
      )?.href,
    ).toBe('https://temporal.example.com/temporal/custom-ui/panel.html');
    expect(
      resolveExtensionSrc('../outside.html', currentOrigin, '/temporal'),
    ).toBeNull();
    expect(
      resolveExtensionSrc('//extensions.example.com/panel', currentOrigin),
    ).toBeNull();
    expect(
      resolveExtensionSrc(
        'https://user@extensions.example.com/panel',
        currentOrigin,
      ),
    ).toBeNull();
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

  it('does not render same-origin extensions when authentication is enabled', () => {
    expect(isIframeExtensionAllowed(extension(), currentOrigin, '', true)).toBe(
      false,
    );
    expect(
      isIframeExtensionAllowed(extension(), currentOrigin, '', false),
    ).toBe(true);
  });

  it('requires every privileged extension to use a dedicated HTTPS origin', () => {
    const privileged = extension({
      permissions: ['context:route'],
    });
    expect(isIframeExtensionAllowed(privileged, currentOrigin)).toBe(false);

    expect(
      isIframeExtensionAllowed(
        extension({
          src: 'https://extensions.example.com/panel.html',
          allowedOrigin: 'https://extensions.example.com',
          permissions: ['context:route'],
          sandbox: {
            ...extension().sandbox,
            allowSameOrigin: true,
          },
        }),
        currentOrigin,
      ),
    ).toBe(true);
  });
});

describe('extension route matching', () => {
  const workflowRouteExtension = extension({
    routePatterns: ['/namespaces/:namespace/workflows/:workflow/:run/*'],
  });

  it('matches all routes when no route patterns are configured', () => {
    expect(extensionMatchesRoute(extension(), '/anything')).toBe(true);
  });

  it('matches configured workflow route patterns', () => {
    expect(
      extensionMatchesRoute(
        workflowRouteExtension,
        '/namespaces/default/workflows/order-workflow/run-1/timeline',
      ),
    ).toBe(true);
  });

  it('matches route patterns against paths beneath the UI base', () => {
    expect(
      extensionMatchesRoute(
        workflowRouteExtension,
        '/temporal/namespaces/default/workflows/order-workflow/run-1/timeline',
        '/temporal',
      ),
    ).toBe(true);
    expect(
      extensionMatchesRoute(
        workflowRouteExtension,
        '/other/namespaces/default/workflows/order-workflow/run-1/timeline',
        '/temporal',
      ),
    ).toBe(false);
  });

  it('matches encoded params and the base route for a trailing wildcard', () => {
    expect(
      extensionMatchesRoute(
        workflowRouteExtension,
        '/namespaces/default/workflows/order%2Fworkflow/run-id/timeline',
      ),
    ).toBe(true);
    expect(
      extensionMatchesRoute(
        workflowRouteExtension,
        '/namespaces/default/workflows/order-workflow/run-1',
      ),
    ).toBe(true);
  });

  it('ignores invalid route patterns', () => {
    expect(
      extensionMatchesRoute(
        extension({ routePatterns: ['(/invalid'] }),
        '/namespaces/default/workflows/order-workflow/run-1/timeline',
      ),
    ).toBe(false);
  });

  it('enforces each slot contribution limit', () => {
    const extensions = Array.from({ length: 5 }, (_, index) =>
      extension({ id: `extension-${index}` }),
    );

    expect(
      extensionsForSlot(
        extensions,
        'workflow.header.after-details',
        '/namespaces/default',
      ),
    ).toHaveLength(4);
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
        allowPopups: true,
      }),
    ).toBe('allow-scripts allow-forms allow-popups');
  });

  it('ignores allow-same-origin for same-origin extensions', () => {
    const sameOriginExtension = extension({
      sandbox: {
        ...extension().sandbox,
        allowSameOrigin: true,
      },
    });

    const allowSameOrigin = effectiveAllowSameOrigin(
      sameOriginExtension,
      currentOrigin,
    );

    expect(allowSameOrigin).toBe(false);
    expect(
      buildIframeSandbox(sameOriginExtension.sandbox, allowSameOrigin),
    ).toBe('allow-scripts');
  });

  it('requires a dedicated https extension origin for allow-same-origin', () => {
    expect(
      effectiveAllowSameOrigin(
        extension({
          src: 'https://extensions.example.com/panel.html',
          allowedOrigin: 'https://extensions.example.com',
          sandbox: {
            ...extension().sandbox,
            allowSameOrigin: true,
          },
        }),
        currentOrigin,
      ),
    ).toBe(true);

    expect(
      effectiveAllowSameOrigin(
        extension({
          src: 'http://localhost:3000/panel.html',
          allowedOrigin: 'http://localhost:3000',
          sandbox: {
            ...extension().sandbox,
            allowSameOrigin: true,
          },
        }),
        currentOrigin,
      ),
    ).toBe(false);
  });

  it('clamps resize heights to configured bounds', () => {
    expect(clampHeight(2000, { minHeight: 100, maxHeight: 400 })).toBe(400);
    expect(clampHeight(20, { minHeight: 100, maxHeight: 400 })).toBe(100);
  });

  it('applies hard slot limits after configured sizing', () => {
    const topNavSizing = constrainSizingToSlot(
      {
        defaultHeight: 500,
        maxHeight: 500,
        defaultWidth: 900,
        maxWidth: 900,
      },
      'app.top-nav.actions.before',
    );
    expect(topNavSizing).toMatchObject({
      defaultHeight: 40,
      maxHeight: 40,
      defaultWidth: 320,
      maxWidth: 320,
    });
    expect(
      initialHeight(constrainSizingToSlot({}, 'app.top-nav.sub-nav')),
    ).toBe(48);
    expect(
      initialWidth(constrainSizingToSlot({}, 'app.top-nav.actions.after')),
    ).toBe(160);
    expect(
      initialWidth(constrainSizingToSlot({}, 'app.top-nav.sub-nav')),
    ).toBeUndefined();
    expect(
      initialWidth(constrainSizingToSlot({}, 'workflow.header.after-details')),
    ).toBeUndefined();
  });
});

describe('extension context and navigation', () => {
  const context = {
    uiVersion: '2.51.0',
    temporalVersion: '1.30.0',
    basePath: '',
    route: {
      pathname: '/namespaces/default/workflows',
      search: '?query=secret',
      params: { namespace: 'default' },
    },
    namespace: 'default',
    workflow: {
      workflowId: 'order-workflow',
      runId: 'run-1',
    },
  };

  it('starts from safe base fields and grants each context group explicitly', () => {
    expect(permittedContext(context, [])).toEqual({
      uiVersion: '2.51.0',
      temporalVersion: '1.30.0',
      basePath: '',
    });
    expect(permittedContext(context, ['context:route'])).toHaveProperty(
      'route',
    );
    expect(permittedContext(context, ['context:namespace'])).toHaveProperty(
      'namespace',
    );
    expect(permittedContext(context, ['context:workflow'])).toHaveProperty(
      'workflow',
    );
  });

  it('allows only Temporal UI application routes', () => {
    expect(safeNavigationPath('/namespaces/default', currentOrigin)).toBe(
      '/namespaces/default',
    );
    expect(safeNavigationPath('/nexus/endpoint', currentOrigin)).toBe(
      '/nexus/endpoint',
    );
    expect(safeNavigationPath('/import/events', currentOrigin)).toBe(
      '/import/events',
    );

    expect(safeNavigationPath('/api/v1/settings', currentOrigin)).toBeNull();
    expect(safeNavigationPath('/auth/logout', currentOrigin)).toBeNull();
    expect(safeNavigationPath('/admin', currentOrigin)).toBeNull();
    expect(
      safeNavigationPath(
        'https://other.example.com/namespaces/default',
        currentOrigin,
      ),
    ).toBeNull();
    expect(safeNavigationPath('javascript:alert(1)', currentOrigin)).toBeNull();
  });

  it('prepends and enforces the configured UI base path', () => {
    expect(
      safeNavigationPath('/namespaces/default', currentOrigin, '/temporal'),
    ).toBe('/temporal/namespaces/default');
    expect(
      safeNavigationPath(
        `${currentOrigin}/temporal/nexus/endpoint`,
        currentOrigin,
        '/temporal',
      ),
    ).toBe('/temporal/nexus/endpoint');
    expect(
      safeNavigationPath(
        `${currentOrigin}/namespaces/default`,
        currentOrigin,
        '/temporal',
      ),
    ).toBeNull();
  });
});

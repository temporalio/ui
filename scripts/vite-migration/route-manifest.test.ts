import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { globSync } from 'fast-glob';
import { describe, expect, it } from 'vitest';

import {
  migrationClientNavigationSourceUrl,
  migrationRouteFamilies,
  migrationRouteFamilyScenarios,
  migrationRouteManifest,
} from './route-manifest';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const pageComponents = globSync('src/routes/**/+page.svelte', {
  cwd: root,
  onlyFiles: true,
}).sort();

const loadOnlyPages = globSync('src/routes/**/+page.ts', {
  cwd: root,
  onlyFiles: true,
})
  .filter(
    (source) =>
      !existsSync(path.join(root, path.dirname(source), '+page.svelte')),
  )
  .sort();

const discoveredSources = [
  ...pageComponents,
  ...loadOnlyPages,
  'src/routes/+error.svelte',
  'src/routes/(app)/render/+server.ts',
].sort();

const routePatternForSource = (source: string): string => {
  if (source === 'src/routes/+error.svelte') return '/[...missing]';

  const segments = path
    .dirname(path.relative('src/routes', source))
    .split(path.sep)
    .filter((segment) => segment !== '.' && !/^\(.+\)$/.test(segment));

  return segments.length ? `/${segments.join('/')}` : '/';
};

const routePatternMatchesUrl = (pattern: string, url: string): boolean => {
  const routeSegments = pattern.split('/').filter(Boolean);
  const urlSegments = new URL(url, 'http://migration-evidence.test').pathname
    .split('/')
    .filter(Boolean);

  if (routeSegments.length !== urlSegments.length) return false;

  return routeSegments.every(
    (segment, index) =>
      segment.startsWith('[') || segment === urlSegments[index],
  );
};

describe('migration route manifest', () => {
  it('derives all 61 page components from the route filesystem', () => {
    expect(pageComponents).toHaveLength(61);
  });

  it('derives all 12 load-only or redirect pages from the route filesystem', () => {
    expect(loadOnlyPages).toHaveLength(12);
  });

  it('contains every page, load-only page, error boundary, and render route', () => {
    expect(migrationRouteManifest.map(({ source }) => source).sort()).toEqual(
      discoveredSources,
    );
  });

  it('contains no duplicate identifiers, sources, or route patterns', () => {
    const fields = ['id', 'source', 'routePattern'] as const;

    for (const field of fields) {
      const values = migrationRouteManifest.map((route) => route[field]);
      expect(new Set(values).size, field).toBe(values.length);
    }
  });

  it('strips route groups while preserving dynamic route segments', () => {
    for (const route of migrationRouteManifest) {
      expect(route.routePattern, route.source).toBe(
        routePatternForSource(route.source),
      );
    }
  });

  it('provides a concrete URL for every dynamic route pattern', () => {
    for (const route of migrationRouteManifest) {
      expect(
        routePatternMatchesUrl(route.routePattern, route.url),
        `${route.routePattern} -> ${route.url}`,
      ).toBe(true);
    }
  });

  it('classifies root as a client redirect to the default workflow list', () => {
    expect(
      migrationRouteManifest.find(({ id }) => id === 'application-home')
        ?.expected,
    ).toMatchObject({
      kind: 'redirect',
      finalPath: '/namespaces/default/workflows',
      httpStatus: 200,
      mechanism: 'client',
    });
  });

  it('classifies latest workflow as the final timeline redirect', () => {
    expect(
      migrationRouteManifest.find(({ id }) => id === 'workflow-latest-run')
        ?.expected,
    ).toMatchObject({
      kind: 'redirect',
      finalPath:
        '/namespaces/default/workflows/09db15_Running/4284ef9a-947f-4db2-bf15-dbc377e71fa6/timeline',
    });
  });

  it('classifies disabled authentication routes as not found', () => {
    for (const id of ['authentication-login', 'authentication-signin']) {
      expect(
        migrationRouteManifest.find((route) => route.id === id)?.expected,
      ).toMatchObject({ kind: 'not-found', httpStatus: 200, appStatus: 404 });
    }
  });

  it('classifies catalog routes as development-only production errors', () => {
    const catalogRoutes = migrationRouteManifest.filter(
      ({ family }) => family === 'catalog',
    );

    expect(catalogRoutes).toHaveLength(2);
    for (const route of catalogRoutes) {
      expect(route.availability).toBe('development-only');
      expect(route.expected).toMatchObject({
        kind: 'not-found',
        httpStatus: 200,
        appStatus: 404,
      });
    }
  });

  it('classifies render as a server response', () => {
    expect(
      migrationRouteManifest.find(({ id }) => id === 'render-markdown')
        ?.expected,
    ).toEqual({
      kind: 'server-response',
      finalPath: '/render',
      httpStatus: 200,
    });
  });

  it('classifies the unknown-route error boundary as an HTTP 404', () => {
    expect(
      migrationRouteManifest.find(({ id }) => id === 'error-boundary')
        ?.expected,
    ).toMatchObject({
      kind: 'not-found',
      httpStatus: 404,
      appStatus: 404,
    });
  });

  it('requires generic client-navigation evidence for every route except render', () => {
    const exemptRoutes = migrationRouteManifest.filter(
      ({ clientNavigation }) => clientNavigation.kind === 'exempt',
    );
    const requiredRoutes = migrationRouteManifest.filter(
      ({ clientNavigation }) => clientNavigation.kind === 'required',
    );

    expect(exemptRoutes.map(({ id }) => id)).toEqual(['render-markdown']);
    expect(requiredRoutes).toHaveLength(74);
    expect(exemptRoutes[0]?.clientNavigation).toEqual({
      kind: 'exempt',
      reason: 'Server-response routes are not SvelteKit page navigations',
    });

    for (const route of migrationRouteManifest) {
      if (route.clientNavigation.kind === 'exempt') continue;

      expect(route.clientNavigation.kind, route.id).toBe('required');
      expect(route.clientNavigation.sourceUrl, route.id).toBe(
        migrationClientNavigationSourceUrl,
      );
      expect(
        typeof route.clientNavigation.expectedWindowPreserved,
        route.id,
      ).toBe('boolean');
      expect(route.expected.kind, route.id).not.toBe('server-response');
    }

    expect(
      migrationRouteManifest
        .filter(
          ({ clientNavigation }) =>
            clientNavigation.kind === 'required' &&
            !clientNavigation.expectedWindowPreserved,
        )
        .map(({ id }) => id),
    ).toEqual(['workflow-history-raw-redirect', 'error-boundary']);
  });

  it('declares catch-all approvals for every route', () => {
    for (const route of migrationRouteManifest) {
      expect(Array.isArray(route.approvedCatchAllApis), route.id).toBe(true);
    }
  });

  it('declares known console-error approvals for every route', () => {
    for (const route of migrationRouteManifest) {
      expect(Array.isArray(route.approvedConsoleErrors), route.id).toBe(true);
    }

    for (const id of [
      'authentication-login',
      'authentication-signin',
      'catalog-list',
      'catalog-example',
      'error-boundary',
    ]) {
      expect(
        migrationRouteManifest.find((route) => route.id === id)
          ?.approvedConsoleErrors,
        id,
      ).toContain('error-status-json-parse');
    }
  });

  it('declares route-specific known page-error approvals', () => {
    for (const route of migrationRouteManifest) {
      expect(Array.isArray(route.approvedPageErrors), route.id).toBe(true);
    }

    expect(
      migrationRouteManifest.find(({ id }) => id === 'workflow-user-metadata')
        ?.approvedPageErrors,
    ).toEqual(['detached-resize-observer-element']);
  });

  it('declares a navigation or non-navigable outcome for every family', () => {
    expect(Object.keys(migrationRouteFamilyScenarios).sort()).toEqual(
      [...migrationRouteFamilies].sort(),
    );

    for (const family of migrationRouteFamilies) {
      const scenario = migrationRouteFamilyScenarios[family];
      expect(
        'navigation' in scenario || 'nonNavigableReason' in scenario,
        family,
      ).toBe(true);
    }

    expect(
      migrationRouteFamilies.filter(
        (family) =>
          'nonNavigableReason' in migrationRouteFamilyScenarios[family],
      ),
    ).toEqual(['authentication', 'catalog', 'system']);

    const scenarioRouteIds = migrationRouteFamilies.flatMap((family) => {
      const scenario = migrationRouteFamilyScenarios[family];
      if (!('navigation' in scenario)) return [];

      expect(
        migrationRouteManifest.find(({ id }) => id === scenario.routeId)
          ?.family,
      ).toBe(family);
      expect(scenario.navigation.control.role).toBe('link');
      expect(scenario.navigation.interaction).toBe('focus');
      expect(scenario.navigation.targetPath).toMatch(/^\//);
      return scenario.routeId;
    });

    expect(scenarioRouteIds).toHaveLength(15);
    expect(new Set(scenarioRouteIds).size).toBe(scenarioRouteIds.length);
  });
});

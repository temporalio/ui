import { get, writable } from 'svelte/store';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const page = writable({ params: {}, data: {} });

vi.mock('$app/stores', () => ({ page }));

const {
  orderByClauseRejected,
  rejectOrderByClause,
  supportsAdvancedVisibilityWithOrderBy,
} = await import('./advanced-visibility');

type PageOverrides = {
  namespace?: string;
  visibilityStore?: string;
  isCloud?: boolean;
  workflowSortingEnabled?: boolean;
};

const setPage = ({
  namespace = 'default',
  visibilityStore = 'elasticsearch',
  isCloud = false,
  workflowSortingEnabled = true,
}: PageOverrides = {}) => {
  page.set({
    params: { namespace },
    data: {
      cluster: { visibilityStore },
      settings: {
        workflowSortingEnabled,
        runtimeEnvironment: { isCloud },
      },
    },
  });
};

beforeEach(() => {
  rejectOrderByClause('');
  setPage();
});

describe('supportsAdvancedVisibilityWithOrderBy', () => {
  it('should be supported on Elasticsearch when the setting is enabled', () => {
    setPage();
    expect(get(supportsAdvancedVisibilityWithOrderBy)).toBe(true);
  });

  it('should not be supported when the setting is disabled', () => {
    setPage({ workflowSortingEnabled: false });
    expect(get(supportsAdvancedVisibilityWithOrderBy)).toBe(false);
  });

  it('should not be supported on a SQL visibility store', () => {
    setPage({ visibilityStore: 'postgres12' });
    expect(get(supportsAdvancedVisibilityWithOrderBy)).toBe(false);
  });

  it('should not be supported on Cloud', () => {
    setPage({ isCloud: true });
    expect(get(supportsAdvancedVisibilityWithOrderBy)).toBe(false);
  });
});

describe('rejectOrderByClause', () => {
  it('should disable sorting for a namespace the server rejected', () => {
    setPage({ namespace: 'rejected-namespace' });
    expect(get(supportsAdvancedVisibilityWithOrderBy)).toBe(true);

    rejectOrderByClause('rejected-namespace');

    expect(get(orderByClauseRejected)).toBe(true);
    expect(get(supportsAdvancedVisibilityWithOrderBy)).toBe(false);
  });

  it('should leave other namespaces unaffected', () => {
    rejectOrderByClause('other-namespace');
    setPage({ namespace: 'default' });

    expect(get(orderByClauseRejected)).toBe(false);
    expect(get(supportsAdvancedVisibilityWithOrderBy)).toBe(true);
  });
});

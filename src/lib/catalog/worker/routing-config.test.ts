import { describe, expect, it } from 'vitest';

import {
  catalogRoutingFromEnvironment,
  requireCatalogRoutingFromEnvironment,
} from './routing-config';

describe('catalogRoutingFromEnvironment', () => {
  it('routes the shared target to the configured namespace by default', () => {
    expect(
      catalogRoutingFromEnvironment({
        TEMPORAL_NAMESPACE: 'runtime-namespace',
      }),
    ).toEqual({
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'ui-catalog',
      },
    });
  });

  it('routes every registered target to the configured namespace with its registered task queue', () => {
    expect(
      catalogRoutingFromEnvironment(
        { TEMPORAL_NAMESPACE: 'runtime-namespace' },
        [
          { targetId: 'shared-workflows', taskQueue: 'ui-catalog' },
          { targetId: 'local-workflows', taskQueue: 'local-queue' },
        ],
      ),
    ).toEqual({
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'ui-catalog',
      },
      'local-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'local-queue',
      },
    });
  });

  it('keeps registered routing when no runtime namespace is configured', () => {
    expect(catalogRoutingFromEnvironment({})).toEqual({});
    expect(
      catalogRoutingFromEnvironment({}, [
        { targetId: 'local-workflows', taskQueue: 'local-queue' },
      ]),
    ).toEqual({});
  });

  it('requires a runtime namespace for the catalog worker', () => {
    expect(() => requireCatalogRoutingFromEnvironment({})).toThrowError(
      'TEMPORAL_NAMESPACE is required',
    );
  });
});

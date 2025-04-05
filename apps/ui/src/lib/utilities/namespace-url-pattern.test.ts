import { describe, expect, it } from 'vitest';

import { namespaceUrlPattern } from './namespace-url-pattern';

describe('Namespace Url Pattern', () => {
  it('Should match a namespace url', () => {
    const result = namespaceUrlPattern.match('/namespaces/stuff/url');
    expect(result).toBeTruthy();
    expect(result).toEqual({
      namespace: 'stuff',
      _: 'url',
    });
  });

  it('Should not match a non namespace url', () => {
    const result = namespaceUrlPattern.match(
      '/namespaces_butdifferent/stuff/url',
    );
    expect(result).toBeNull();
  });

  it('Should match a namespace with special characters in it like . _ -', () => {
    const result = namespaceUrlPattern.match(
      '/namespaces/sergey.temporal-dev_test/workflows/d643b6a9-b73d-4440-b1ec-91234bbc0a11/e8c0acc6-740e-428d-a2e2-c9bb7c081c9c/history/full',
    );

    expect(result).toBeTruthy();
    expect(result).toEqual({
      namespace: 'sergey.temporal-dev_test',
      _: 'workflows/d643b6a9-b73d-4440-b1ec-91234bbc0a11/e8c0acc6-740e-428d-a2e2-c9bb7c081c9c/history/full',
    });
  });
});

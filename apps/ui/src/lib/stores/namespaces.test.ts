import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { lastUsedNamespace, namespaces } from './namespaces';

describe('lastUsedNamespace', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should default to "default"', () => {
    expect(get(lastUsedNamespace)).toEqual('default');
  });

  it('should be able to set a value', () => {
    lastUsedNamespace.set('test');
    expect(get(lastUsedNamespace)).toEqual('test');
  });

  it('should store values in localStorage', () => {
    lastUsedNamespace.set('test');
    expect(localStorage.getItem('lastNamespace')).toMatch('test');
  });

  it('should store values in localStorage', () => {
    lastUsedNamespace.set('test');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'lastNamespace',
      JSON.stringify('test'),
    );
  });
});

describe('namespaces', () => {
  beforeEach(() => {
    namespaces.set([]);
  });

  it('should be able to set a value', () => {
    namespaces.set([{ name: 'default' }]);
    expect(get(namespaces)).toEqual([{ name: 'default' }]);
  });
});

import { describe, expect, it } from 'vitest';

import { getNexusLinksView } from './nexus-links-view';

describe('getNexusLinksView', () => {
  it('selects the requested view when it has links', () => {
    expect(getNexusLinksView('outbound', { inbound: 2, outbound: 3 })).toBe(
      'outbound',
    );
  });

  it('defaults to inbound when nothing is requested and inbound has links', () => {
    expect(getNexusLinksView(null, { inbound: 2, outbound: 3 })).toBe(
      'inbound',
    );
  });

  it('defaults to outbound when inbound has no links', () => {
    expect(getNexusLinksView(null, { inbound: 0, outbound: 3 })).toBe(
      'outbound',
    );
  });

  it('selects the requested view even when it has no links', () => {
    expect(getNexusLinksView('inbound', { inbound: 0, outbound: 3 })).toBe(
      'inbound',
    );
    expect(getNexusLinksView('outbound', { inbound: 2, outbound: 0 })).toBe(
      'outbound',
    );
  });

  it('ignores an unknown requested view', () => {
    expect(getNexusLinksView('sideways', { inbound: 0, outbound: 3 })).toBe(
      'outbound',
    );
  });
});

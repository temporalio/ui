import { describe, expect, it } from 'vitest';

import { Strings } from './events';

describe('events i18n locale', () => {
  it('has expand-details key (required by event-summary-row expand chevron)', () => {
    expect(Strings).toHaveProperty('expand-details');
    expect(typeof Strings['expand-details']).toBe('string');
    expect(Strings['expand-details'].length).toBeGreaterThan(0);
  });

  it('has collapse-details key (required by event-summary-row expand chevron)', () => {
    expect(Strings).toHaveProperty('collapse-details');
    expect(typeof Strings['collapse-details']).toBe('string');
    expect(Strings['collapse-details'].length).toBeGreaterThan(0);
  });
});

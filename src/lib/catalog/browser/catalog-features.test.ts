import { describe, expect, it } from 'vitest';

import { featureLabel } from './catalog-features';

describe('featureLabel', () => {
  it('uses Temporal capitalization for known features', () => {
    expect(featureLabel('child-workflows')).toBe('Child Workflows');
    expect(featureLabel('local-activities')).toBe('Local Activities');
    expect(featureLabel('event-history')).toBe('Event History');
    expect(featureLabel('priority-fairness')).toBe('Priority and Fairness');
  });

  it('falls back to sentence case for unknown features', () => {
    expect(featureLabel('worker-versioning-rules')).toBe(
      'Worker versioning rules',
    );
    expect(featureLabel('toString')).toBe('ToString');
  });
});

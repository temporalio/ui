import { describe, expect, it } from 'vitest';

import { requestBlocksEvidenceSettlement } from '../../tests/migration-evidence/evidence-tracker';

describe('requestBlocksEvidenceSettlement', () => {
  it('waits for finite page resources', () => {
    expect(requestBlocksEvidenceSettlement('document', false)).toBe(true);
    expect(requestBlocksEvidenceSettlement('script', false)).toBe(true);
  });

  it('does not wait for streaming media resources', () => {
    expect(requestBlocksEvidenceSettlement('media', false)).toBe(false);
  });

  it('always waits for application API requests', () => {
    expect(requestBlocksEvidenceSettlement('media', true)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import {
  catalogPromotionUnavailableReasonLabel,
  catalogSaveOutcomePresentation,
} from './catalog-save-presentation';

describe('catalog Save presentation', () => {
  it('describes durable success, stale refusal, and clean rollback truthfully', () => {
    expect(
      catalogSaveOutcomePresentation({
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: ['catalog.local/examples/payment-reminder/workflow.ts'],
        generatedOutputs: [],
      }),
    ).toMatchObject({ title: 'Saved and verified', kind: 'success' });
    expect(
      catalogSaveOutcomePresentation({
        status: 'refused',
        reason: 'stale-revision',
        detail: 'The example changed after it was loaded.',
      }),
    ).toEqual({
      kind: 'failure',
      title: 'Save refused',
      detail: 'The example changed after it was loaded.',
      action: 'Reload files',
    });
    expect(
      catalogSaveOutcomePresentation({
        status: 'failed',
        reason: 'check-failed',
        filesystem: 'restored',
        recovery: 'rolled-back',
      }),
    ).toEqual({
      kind: 'failure',
      title: 'Save rolled back',
      detail: 'Files on disk were restored. Your browser edits are still here.',
      action: 'Retry Save',
    });
  });
});

describe('catalog Promote presentation', () => {
  it('distinguishes each unavailable preview reason', () => {
    expect(catalogPromotionUnavailableReasonLabel('unsaved-changes')).toBe(
      'Save all browser changes before promoting.',
    );
    expect(catalogPromotionUnavailableReasonLabel('save-failed')).toBe(
      'Resolve the failed Save before promoting.',
    );
    expect(catalogPromotionUnavailableReasonLabel('saved-revision-stale')).toBe(
      'Reload the stale example before promoting.',
    );
    expect(
      catalogPromotionUnavailableReasonLabel('preview-not-supported'),
    ).toBe('Promotion preview is not supported in this environment.');
  });
});

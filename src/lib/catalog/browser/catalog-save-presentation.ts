import type {
  CatalogPromotionPreview,
  CatalogSaveProgressEvent,
  CatalogSaveTerminalOutcome,
} from './catalog-authoring-host';

type CatalogPromotionUnavailableReason = Extract<
  CatalogPromotionPreview,
  { status: 'unavailable' }
>['reason'];

export const catalogPromotionUnavailableReasonLabel = (
  reason: CatalogPromotionUnavailableReason,
): string =>
  ({
    'preview-not-supported':
      'Promotion preview is not supported in this environment.',
    'save-failed': 'Resolve the failed Save before promoting.',
    'saved-revision-stale': 'Reload the stale example before promoting.',
    'unsaved-changes': 'Save all browser changes before promoting.',
  })[reason];

export type CatalogSaveOutcomePresentation = {
  action?: 'Inspect recovery' | 'Reload files' | 'Retry Save';
  detail: string;
  kind: 'failure' | 'success';
  title: string;
};

export const catalogSaveOutcomePresentation = (
  outcome: CatalogSaveTerminalOutcome,
): CatalogSaveOutcomePresentation => {
  if (outcome.status === 'succeeded') {
    return {
      kind: 'success',
      title: 'Saved and verified',
      detail: 'The example and generated catalog files are durable on disk.',
    };
  }

  if (outcome.status === 'refused') {
    return {
      kind: 'failure',
      title: 'Save refused',
      detail:
        outcome.detail ??
        (outcome.reason === 'catalog-busy'
          ? 'Another catalog change is in progress.'
          : outcome.reason === 'stale-revision'
            ? 'The example changed after it was loaded.'
            : 'The complete file set is not valid.'),
      action:
        outcome.reason === 'stale-revision' ? 'Reload files' : 'Retry Save',
    };
  }

  if (
    outcome.reason === 'check-failed' &&
    outcome.filesystem === 'restored' &&
    outcome.recovery === 'rolled-back'
  ) {
    return {
      kind: 'failure',
      title: 'Save rolled back',
      detail: 'Files on disk were restored. Your browser edits are still here.',
      action: 'Retry Save',
    };
  }

  const titles = {
    'check-failed': 'Save failed',
    'finalization-failed': 'Save finalization failed',
    'outcome-unknown': 'Save outcome unknown',
    'recovery-incomplete': 'Recovery incomplete',
  } as const;

  return {
    kind: 'failure',
    title: titles[outcome.reason],
    detail:
      'The filesystem may have changed. Inspect the recovery evidence before trying again.',
    action: 'Inspect recovery',
  };
};

export const catalogSaveStepLabel = (step: string): string =>
  step
    .split('_')
    .filter(Boolean)
    .map((part, index) =>
      index === 0 ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part,
    )
    .join(' ');

export const catalogSaveStateLabel = (
  state: CatalogSaveProgressEvent['state'],
): string =>
  ({
    failed: 'Failed',
    'not-reached': 'Not reached',
    passed: 'Passed',
    started: 'Running',
  })[state];

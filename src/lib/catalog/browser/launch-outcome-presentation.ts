import type { LaunchOutcome } from './workbench-host';

const rejectionExplanations: Record<string, string> = {
  aborted: 'The start was cancelled before it reached the server.',
  conflict: 'An execution with this ID is already running.',
  forbidden: 'You do not have permission to start this execution.',
  'invalid-request': 'The server rejected the request as invalid.',
  'not-found':
    'This server does not support that execution, or the target is missing.',
};

const uncertainExplanations: Record<string, string> = {
  'aborted-after-dispatch':
    'The start was cancelled after it was sent, so it may have started anyway.',
  'transport-failure':
    'The connection failed while starting, so it may have started anyway.',
  'unusable-response':
    'The server replied in a way this UI could not read, so the start could not be confirmed.',
};

export const launchOutcomeExplanation = (
  outcome: LaunchOutcome | undefined,
): string | undefined => {
  if (!outcome) return undefined;
  if (outcome.status === 'rejected') {
    return rejectionExplanations[outcome.reason];
  }
  if (outcome.status === 'uncertain') {
    return uncertainExplanations[outcome.reason];
  }

  return undefined;
};

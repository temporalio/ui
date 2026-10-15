import { apiRequestsForParity, type ApiRequestSummary } from './api-evidence';

export type ClientNavigationEvent = {
  type: string;
  url: string | null;
};

export type ClientNavigationEvidence = {
  kind: 'collected';
  sourceUrl: string;
  targetUrl: string;
  finalUrl: string;
  expected: {
    finalPath: string;
    appStatus: number;
    windowPreserved: boolean;
  };
  observed: {
    finalPath: string;
    appStatus: number;
  };
  navigationEvents: ClientNavigationEvent[];
  windowSentinel: {
    expected: string;
    observed: string | null;
    preserved: boolean;
  };
  navigationError: string | null;
  settleError: string | null;
  appApiRequests: ApiRequestSummary[];
  catchAllMocks: {
    used: string[];
    unapproved: string[];
  };
  consoleMessages: unknown[];
  consoleMessagesForParity: unknown[];
  unexpectedConsoleErrors: unknown[];
  pageErrors: string[];
  unexpectedPageErrors: unknown[];
  errors: string[];
};

export type ClientNavigationExemption = {
  kind: 'exempt';
  reason: string;
};

export type ClientNavigationResult =
  | ClientNavigationEvidence
  | ClientNavigationExemption;

export type ClientNavigationParity = Omit<
  ClientNavigationEvidence,
  'appApiRequests' | 'consoleMessages' | 'pageErrors'
> & {
  appApiRequests: ApiRequestSummary[];
};

export function clientNavigationForParity(
  evidence: ClientNavigationEvidence,
): ClientNavigationParity;
export function clientNavigationForParity(
  evidence: ClientNavigationExemption,
): ClientNavigationExemption;
export function clientNavigationForParity(
  evidence: ClientNavigationResult,
): ClientNavigationParity | ClientNavigationExemption;
export function clientNavigationForParity(
  evidence: ClientNavigationResult,
): ClientNavigationParity | ClientNavigationExemption {
  if (evidence.kind === 'exempt') return evidence;

  const { appApiRequests, consoleMessages, pageErrors, ...projection } =
    evidence;
  void consoleMessages;
  void pageErrors;

  return {
    ...projection,
    appApiRequests: apiRequestsForParity(appApiRequests),
  };
}

export const clientNavigationStatus = (
  manifestKind: 'required' | 'exempt',
  evidence: ClientNavigationResult | null | undefined,
): 'collected' | 'exempt' | 'missing' => {
  if (manifestKind === 'required') {
    return evidence?.kind === 'collected' ? 'collected' : 'missing';
  }

  return evidence?.kind === 'exempt' ? 'exempt' : 'missing';
};

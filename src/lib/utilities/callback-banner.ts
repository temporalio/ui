import { translate } from '$lib/i18n/translate';
import type { EventLink } from '$lib/types';
import type { Callback } from '$lib/types/nexus';

export type CallbackBannerKind = 'none' | 'single' | 'summary';

export type CallbackStateCount = {
  state: string;
  label: string;
  count: number;
};

export const CALLBACK_SUMMARY_STATES = [
  'Standby',
  'Scheduled',
  'BackingOff',
  'Blocked',
  'Succeeded',
  'Failed',
] as const;

type CallbackSummaryState = (typeof CALLBACK_SUMMARY_STATES)[number];

const summaryLabels: Record<CallbackSummaryState, () => string> = {
  Standby: () => translate('nexus.callback-summary-state.standby'),
  Scheduled: () => translate('nexus.callback-summary-state.scheduled'),
  BackingOff: () => translate('nexus.callback-summary-state.backing-off'),
  Blocked: () => translate('nexus.callback-summary-state.blocked'),
  Succeeded: () => translate('nexus.callback-summary-state.succeeded'),
  Failed: () => translate('nexus.callback-summary-state.failed'),
};

const bannerTitles: Record<CallbackSummaryState, () => string> = {
  Standby: () => translate('nexus.callback-banner.standby'),
  Scheduled: () => translate('nexus.callback-banner.scheduled'),
  BackingOff: () => translate('nexus.callback-banner.backing-off'),
  Blocked: () => translate('nexus.callback-banner.blocked'),
  Succeeded: () => translate('nexus.callback-banner.succeeded'),
  Failed: () => translate('nexus.callback-banner.failed'),
};

const isSummaryState = (state: string): state is CallbackSummaryState =>
  (CALLBACK_SUMMARY_STATES as readonly string[]).includes(state);

export const callbackBannerKind = (
  ownCallbackCount: number,
  workerCallbackLinkCount: number,
): CallbackBannerKind => {
  const total = ownCallbackCount + workerCallbackLinkCount;
  if (total === 0) return 'none';
  if (total === 1) return 'single';
  return 'summary';
};

export const callbackBannerTitle = (
  state: string | null | undefined,
): string => {
  const readable = String(state ?? '');
  if (isSummaryState(readable)) return bannerTitles[readable]();
  return translate('nexus.callback-banner.unspecified');
};

export const callbackStateCounts = (
  callbacks: Callback[],
): CallbackStateCount[] =>
  CALLBACK_SUMMARY_STATES.map((state) => ({
    state,
    label: summaryLabels[state](),
    count: callbacks.filter((callback) => String(callback.state) === state)
      .length,
  }));

export type WorkerCallbackSource = {
  namespace: string;
  operationId: string;
  runId: string;
  requestId: string;
};

const isPresent = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.length > 0;

export const workerCallbackSource = (
  link: EventLink | undefined,
): WorkerCallbackSource | undefined => {
  const callback = link?.callback;
  const namespace = callback?.namespace;
  const operationId = callback?.execution?.businessId;
  const runId = callback?.execution?.runId;
  const requestId = callback?.requestId;
  if (String(callback?.execution?.type) !== 'EXECUTION_TYPE_NEXUS_OPERATION') {
    return undefined;
  }
  if (
    !isPresent(namespace) ||
    !isPresent(operationId) ||
    !isPresent(runId) ||
    !isPresent(requestId)
  ) {
    return undefined;
  }

  return { namespace, operationId, runId, requestId };
};

export const findSourceCallback = (
  callbacks: Callback[],
  requestId: string,
): Callback | undefined =>
  callbacks.find((callback) => callback.requestId === requestId);

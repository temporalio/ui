import { translate } from '$lib/i18n/translate';
import type { BadgeColorScheme } from '$lib/io/badge/recipe';
import type { EventLink } from '$lib/types';
import type {
  EventLinkVariant,
  EventLinkView,
} from '$lib/utilities/event-link';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

export type CallbackDeliveryState = {
  label: string;
  colorScheme: BadgeColorScheme;
};

const deliveryStates: Record<string, () => CallbackDeliveryState> = {
  Standby: () => ({
    label: translate('nexus.callback-state.standby'),
    colorScheme: 'neutral',
  }),
  Scheduled: () => ({
    label: translate('nexus.callback-state.scheduled'),
    colorScheme: 'info',
  }),
  BackingOff: () => ({
    label: translate('nexus.callback-state.backing-off'),
    colorScheme: 'error',
  }),
  Failed: () => ({
    label: translate('nexus.callback-state.failed'),
    colorScheme: 'danger',
  }),
  Succeeded: () => ({
    label: translate('nexus.callback-state.succeeded'),
    colorScheme: 'success',
  }),
  Blocked: () => ({
    label: translate('nexus.callback-state.blocked'),
    colorScheme: 'warning',
  }),
};

export const callbackDeliveryState = (
  state: string | null | undefined,
): CallbackDeliveryState => {
  const deliveryState = state ? deliveryStates[state] : undefined;
  if (deliveryState) return deliveryState();

  return {
    label: translate('nexus.callback-state.unspecified'),
    colorScheme: 'neutral',
  };
};

export const callbackTargetTypeLabel = (
  variant: EventLinkVariant,
): string | undefined => {
  switch (variant) {
    case 'workflowEvent':
    case 'workflow':
      return translate('nexus.target-type-workflow-execution');
    case 'activity':
      return translate('nexus.target-type-standalone-activity');
    case 'batchJob':
      return translate('nexus.target-type-batch-job');
    case 'nexusOperation':
      return translate('nexus.target-type-standalone-nexus-operation');
    default:
      return undefined;
  }
};

export const callbackTargetName = (
  link: EventLink,
  view: EventLinkView,
): string => {
  return (
    link.workflowEvent?.workflowId || link.workflow?.workflowId || view.value
  );
};

export const callbackTargetEvent = (link: EventLink): string | undefined => {
  const eventType =
    link.workflowEvent?.eventRef?.eventType ??
    link.workflowEvent?.requestIdRef?.eventType;
  if (!eventType) return undefined;

  return String(fromScreamingEnum(eventType, 'EventType'));
};

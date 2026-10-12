import type { LifecycleGroupFilterDefinition } from '../types';

/** Matches failed outcomes or pending lifecycles using details when available. */
export const isPendingOrFailed: LifecycleGroupFilterDefinition = {
  key: 'status:pending-or-failed',
  dependsOnExecutionDetails: true,
  matches: (group, _getEvent, details) => {
    if (group.terminalOutcome) {
      return (
        group.terminalOutcome === 'failed' ||
        group.terminalOutcome === 'timed-out'
      );
    }

    if (!details) {
      return group.hasPendingEvent;
    }

    switch (group.kind) {
      case 'activity': {
        return (
          group.activityId !== null &&
          details.pendingActivitiesByActivityId.has(group.activityId)
        );
      }

      case 'nexus-operation': {
        return details.pendingNexusOperationsByHeadEventId.has(
          group.headEventId,
        );
      }

      default: {
        return group.hasPendingEvent;
      }
    }
  },
};

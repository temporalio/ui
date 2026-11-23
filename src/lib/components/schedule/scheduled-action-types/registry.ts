import type { ScheduledActionDefinition, ScheduledActionType } from './types';
import {
  resolveWorkflowAction,
  resolveWorkflowActionListEntry,
} from './workflow/action';
import { toWorkflowScheduleRequest } from './workflow/request-mappings';

export const scheduledActionDefinitions: {
  [Type in ScheduledActionType]: ScheduledActionDefinition<Type>;
} = {
  workflow: {
    type: 'workflow',
    createAction: () => ({ type: 'workflow', schedule: null }),
    resolveSchedule: resolveWorkflowAction,
    resolveListEntry: resolveWorkflowActionListEntry,
    toRequest: toWorkflowScheduleRequest,
  },
};

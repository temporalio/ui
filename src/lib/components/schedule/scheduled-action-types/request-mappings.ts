import type {
  ScheduledActionFormData,
  ScheduledActionRequest,
  SupportedScheduledAction,
} from './types';
import { toWorkflowScheduleRequest } from './workflow/request-mappings';

export function toScheduledActionRequest(
  actionForm: ScheduledActionFormData,
  resolvedAction: SupportedScheduledAction,
): Promise<ScheduledActionRequest> {
  switch (actionForm.type) {
    case 'workflow':
      if (resolvedAction.type !== 'workflow') {
        throw new Error(
          'The form and existing schedule action types do not match',
        );
      }
      return toWorkflowScheduleRequest(actionForm, resolvedAction);
  }
}

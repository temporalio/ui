import { scheduledActionDefinitions } from './registry';
import type {
  ScheduledActionFormData,
  ScheduledActionRequest,
  ScheduledActionType,
  SupportedScheduledAction,
} from './types';

export function toScheduledActionRequest<Type extends ScheduledActionType>(
  actionForm: ScheduledActionFormData<Type>,
  resolvedAction: NoInfer<SupportedScheduledAction<Type>>,
): Promise<ScheduledActionRequest> {
  return scheduledActionDefinitions[actionForm.type].toRequest(
    actionForm,
    resolvedAction,
  );
}

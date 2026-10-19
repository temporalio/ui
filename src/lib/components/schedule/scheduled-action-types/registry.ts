import type {
  ScheduledActionDefinition,
  ScheduledActionFormData,
} from './types';
import { workflowActionDefinition } from './workflow/definition';

export const scheduledActionTypes = {
  workflow: workflowActionDefinition,
} satisfies Record<ScheduledActionFormData['type'], ScheduledActionDefinition>;

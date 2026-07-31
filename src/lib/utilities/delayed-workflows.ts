import { isFuture } from '$lib/utilities/format-date';

export const isWorkflowDelayed = (workflow: {
  executionTime?: Parameters<typeof isFuture>[0];
}): boolean => {
  return !!workflow.executionTime && isFuture(workflow.executionTime);
};

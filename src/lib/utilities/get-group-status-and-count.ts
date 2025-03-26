import { workflowStatuses } from '$lib/models/workflow-status';
import type { WorkflowStatus } from '$lib/types/workflows';

import { decodePayload } from './decode-payload';

export const getStatusAndCountOfGroup = (groups = []) => {
  return groups
    .map((group) => {
      const status = decodePayload(
        group?.groupValues[0],
      ) as unknown as WorkflowStatus;
      const count = parseInt(group.count);
      return {
        status,
        count,
      };
    })
    .sort((a, b) => {
      return (
        workflowStatuses.indexOf(a.status) - workflowStatuses.indexOf(b.status)
      );
    });
};

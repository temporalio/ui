import { workflowStatuses } from '$lib/models/workflow-status';
import type { WorkflowStatus } from '$lib/types/workflows';

import { parseRawPayloadToJSON } from './decode-payload';

export const getStatusAndCountOfGroup = (groups = []) => {
  return groups
    .map((group) => {
      const status = parseRawPayloadToJSON(
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

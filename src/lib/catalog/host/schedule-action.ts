import type { Payload } from '$lib/types';

import type { BrowserScheduleAction, JsonValue } from '../browser/types';

export type EncodeCatalogInput = (
  input: JsonValue,
  positional: boolean,
) => Promise<Payload[]>;

export const encodeScheduleAction = async ({
  action,
  input,
  scheduleId,
  taskQueue,
  encodeInput,
}: {
  action: BrowserScheduleAction;
  input: JsonValue;
  scheduleId: string;
  taskQueue: string;
  encodeInput: EncodeCatalogInput;
}) => {
  switch (action.kind) {
    case 'workflow': {
      const payloads = await encodeInput(input, true);

      return {
        startWorkflow: {
          workflowId: `catalog-${scheduleId}`,
          workflowType: { name: action.workflowType },
          taskQueue: { name: taskQueue },
          input: { payloads },
        },
      };
    }
    default:
      throw new Error('Unsupported scheduled action kind');
  }
};

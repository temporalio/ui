import { z } from 'zod/v3';

import { searchAttributesSchema } from '$lib/stores/search-attributes';
import type { FullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';
import { decodePayloadAttributes } from '$lib/utilities/decode-payload';

import type { SearchAttribute } from '$types';

export const scheduleFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(232, 'Name is too long'),
  workflowType: z.string().min(1, 'Workflow type is required'),
  workflowId: z.string().min(1, 'Workflow ID is required'),
  taskQueue: z.string().min(1, 'Task queue is required'),
  input: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Input must be valid JSON',
      },
    ),
  editInput: z.boolean(),
  encoding: z.enum(['json/plain', 'json/protobuf'] as const),
  messageType: z.string().optional(),
  daysOfWeek: z.array(z.string()),
  daysOfMonth: z.array(z.number()),
  months: z.array(z.string()),
  days: z.string(),
  hour: z.string(),
  minute: z.string(),
  second: z.string(),
  phase: z.string(),
  cronString: z.string(),
  timezoneName: z.string(),
  searchAttributes: searchAttributesSchema,
  workflowSearchAttributes: searchAttributesSchema,
});

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

export const getDefaultValues = (params: {
  schedule: FullSchedule | null;
  searchAttributes: SearchAttribute;
  customSearchAttributes: SearchAttributes;
  scheduleId: string;
}): ScheduleFormData => {
  const {
    schedule,
    searchAttributes = {},
    customSearchAttributes = {},
    scheduleId,
  } = params;

  const decodedSearchAttributes = decodePayloadAttributes({ searchAttributes });
  const decodedWorkflowSearchAttributes = decodePayloadAttributes({
    searchAttributes: schedule?.action?.startWorkflow?.searchAttributes ?? {},
  });

  const indexedFields =
    decodedSearchAttributes?.searchAttributes.indexedFields ??
    ({} as { [k: string]: string });
  const workflowIndexedFields =
    decodedWorkflowSearchAttributes?.searchAttributes.indexedFields ??
    ({} as { [k: string]: string });

  const searchAttributesInput = Object.entries(indexedFields).map(
    ([label, value]) => ({
      label,
      value,
      type: customSearchAttributes[label],
    }),
  );

  const workflowSearchAttributesInput = Object.entries(
    workflowIndexedFields,
  ).map(([label, value]) => ({
    label,
    value,
    type: customSearchAttributes[label],
  }));

  return {
    name: scheduleId ?? '',
    workflowType: schedule?.action?.startWorkflow?.workflowType?.name ?? '',
    workflowId: schedule?.action?.startWorkflow?.workflowId ?? '',
    taskQueue: schedule?.action?.startWorkflow?.taskQueue?.name ?? '',
    input: '',
    editInput: !schedule,
    encoding: 'json/plain',
    messageType: '',
    daysOfWeek: [],
    daysOfMonth: [],
    months: [],
    days: '',
    hour: '',
    minute: '',
    second: '',
    phase: '',
    cronString: '',
    timezoneName: schedule?.spec?.timezoneName ?? 'UTC',
    searchAttributes: searchAttributesInput,
    workflowSearchAttributes: workflowSearchAttributesInput,
  };
};

import { z } from 'zod/v3';

import { searchAttributesSchema } from '$lib/stores/search-attributes';

import { schedulePoliciesFormSchema } from './policies-form-schema';
import { scheduleSpecItemFormSchema } from './spec-item-form-schema';

export const scheduleFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(232, 'Name is too long'),
    workflowType: z.string().min(1, 'Workflow type is required'),
    workflowId: z.string(),
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
    specs: z
      .array(scheduleSpecItemFormSchema)
      .min(1, 'At least one schedule spec is required'),
    timezoneName: z.string(),
    startDate: z.string().optional().default(''),
    endDateType: z.enum(['never', 'on', 'after']),
    endDate: z.string().optional().default(''),
    endAfterOccurrences: z.number().optional(),
    jitter: z.string().optional().default('0'),
    keepOriginalWorkflowId: z.boolean(),
    searchAttributes: searchAttributesSchema,
    workflowSearchAttributes: searchAttributesSchema,
  })
  .merge(schedulePoliciesFormSchema);

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

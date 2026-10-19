import { z } from 'zod/v3';

import { searchAttributesSchema } from '$lib/stores/search-attributes';

import { DEFAULT_TASK_TIMEOUT } from '../../constants';
import {
  durationString,
  durationStringWithDefault,
  jsonString,
} from '../../schema/common';

const optionalDurationString = () =>
  z
    .preprocess(
      (input) => input ?? '',
      z.union([z.literal(''), durationString()]),
    )
    .default('');

export const formWorkflowPoliciesSchema = z.object({
  taskTimeout: durationStringWithDefault(DEFAULT_TASK_TIMEOUT),
  runTimeout: optionalDurationString(),
  executionTimeout: optionalDurationString(),
  keepOriginalWorkflowId: z.boolean().optional(),
});

export type FormWorkflowPolicies = z.infer<typeof formWorkflowPoliciesSchema>;

export const formWorkflowDetailsSchema = z
  .object({
    workflowType: z.string().trim().min(1, 'Workflow type is required'),
    workflowId: z.string().trim().default(''),
    taskQueue: z.string().trim().min(1, 'Task queue is required'),
    input: jsonString().optional(),
    editInput: z.boolean().default(false),
    encoding: z.enum(['json/plain', 'json/protobuf']).default('json/plain'),
    messageType: z.string().trim().optional(),
    workflowSearchAttributes: searchAttributesSchema.default([]),
  })
  .merge(formWorkflowPoliciesSchema);

export type FormWorkflowDetails = z.infer<typeof formWorkflowDetailsSchema>;

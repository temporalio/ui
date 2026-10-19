import { z } from 'zod/v3';

import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { translate } from '$lib/i18n/translate';
import { searchAttributesSchema } from '$lib/stores/search-attributes';

import { DEFAULT_TASK_TIMEOUT, MAX_TASK_TIMEOUT_SECONDS } from './constants';
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

export const formWorkflowDetailsSchema = z.object({
  workflowType: z.string().trim().min(1, 'Workflow type is required'),
  workflowId: z.string().trim().default(''),
  taskQueue: z.string().trim().min(1, 'Task queue is required'),
  input: jsonString().optional(),
  editInput: z.boolean().default(false),
  encoding: z.enum(['json/plain', 'json/protobuf']).default('json/plain'),
  messageType: z.string().trim().optional(),
  workflowSearchAttributes: searchAttributesSchema.default([]),
  taskTimeout: durationStringWithDefault(DEFAULT_TASK_TIMEOUT).refine(
    (duration) => Number(parseDuration(duration)) <= MAX_TASK_TIMEOUT_SECONDS,
    () => ({
      message: translate('schedules.task-timeout-max-error', {
        max: MAX_TASK_TIMEOUT_SECONDS,
      }),
    }),
  ),
  runTimeout: optionalDurationString(),
  executionTimeout: optionalDurationString(),
  keepOriginalWorkflowId: z.boolean().optional(),
});

export type FormWorkflowDetails = z.infer<typeof formWorkflowDetailsSchema>;

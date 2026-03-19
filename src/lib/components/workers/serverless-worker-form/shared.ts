import { z } from 'zod/v3';

import type { MockValidationResult } from '$lib/types/serverless-workers';

export const regions = [
  { value: 'us-east-1', label: 'US East (N. Virginia) — us-east-1' },
  { value: 'us-west-2', label: 'US West (Oregon) — us-west-2' },
  { value: 'eu-west-1', label: 'EU (Ireland) — eu-west-1' },
  {
    value: 'ap-southeast-1',
    label: 'Asia Pacific (Singapore) — ap-southeast-1',
  },
];

export type ValidationState = {
  checking: boolean;
  result?: MockValidationResult;
};

const baseFields = {
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100)
    .regex(/^[a-z][a-z0-9-]*$/, 'Must be lowercase, alphanumeric with hyphens'),
  lambdaArn: z
    .string()
    .min(1, 'Lambda ARN is required')
    .regex(
      /^arn:aws:lambda:[a-z0-9-]+:\d{12}:function:.+$/,
      'Invalid Lambda ARN format',
    ),
  iamRoleArn: z
    .string()
    .min(1, 'IAM Role ARN is required')
    .regex(/^arn:aws:iam::\d{12}:role\/.+$/, 'Invalid IAM Role ARN format'),
  region: z.string().min(1, 'Region is required'),
};

export const createSchema = z.object({
  ...baseFields,
  minInstances: z.number().int().min(0).optional(),
  maxInstances: z.number().int().min(1).optional(),
});

export const editSchema = z.object({
  ...baseFields,
  maxWorkers: z.number().min(1).max(100),
  maxConcurrentActivities: z.number().min(1).max(50),
  maxTaskQueueActivitiesPerSecond: z.number().min(1).max(10000),
  idleTimeoutSeconds: z.number().min(30).max(3600),
});

export type CreateFormData = z.infer<typeof createSchema>;
export type EditFormData = z.infer<typeof editSchema>;

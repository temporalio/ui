import { z } from 'zod/v3';

const arnFields = {
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
  roleExternalId: z.string().min(1, 'External ID is required'),
};

const scalingFields = {
  scaleUpCooloffMs: z.number().int().min(0).optional(),
  scaleUpBacklogThreshold: z.number().int().min(0).optional(),
  maxWorkerLifetimeMs: z.number().int().min(0).optional(),
  scaleUpDispatchRateEpsilon: z.number().min(0).optional(),
  metricsPollIntervalMs: z.number().int().min(10000).optional(),
};

export const createDeploymentSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100)
    .regex(/^[a-z][a-z0-9-]*$/, 'Must be lowercase, alphanumeric with hyphens'),
  buildId: z.string().min(1, 'Build ID is required'),
  ...arnFields,
  ...scalingFields,
});

export const createVersionSchema = z.object({
  buildId: z.string().min(1, 'Build ID is required'),
  ...arnFields,
  ...scalingFields,
});

export const editVersionSchema = z.object({
  ...arnFields,
  ...scalingFields,
});

export type CreateDeploymentFormData = z.infer<typeof createDeploymentSchema>;
export type CreateVersionFormData = z.infer<typeof createVersionSchema>;
export type EditVersionFormData = z.infer<typeof editVersionSchema>;

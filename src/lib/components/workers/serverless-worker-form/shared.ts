import { z } from 'zod/v3';

const scalingFields = {
  scaleUpCooloffMs: z.number().int().min(0).optional(),
  scaleUpBacklogThreshold: z.number().int().min(0).optional(),
  maxWorkerLifetimeMs: z.number().int().min(0).optional(),
  metricsPollIntervalMs: z.number().int().min(10000).optional(),
};

const providerFields = {
  provider: z.enum(['lambda', 'cloud-run']).default('lambda'),
  lambdaArn: z.string().default(''),
  iamRoleArn: z.string().default(''),
  roleExternalId: z.string().default(''),
  gcpProject: z.string().default(''),
  gcpRegion: z.string().default(''),
  gcpWorkerPool: z.string().default(''),
  gcpServiceAccount: z.string().default(''),
};

const validateProviderFields = (
  data: z.infer<z.ZodObject<typeof providerFields>>,
  ctx: z.RefinementCtx,
) => {
  if (data.provider === 'lambda') {
    if (!data.lambdaArn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lambdaArn'],
        message: 'Lambda ARN is required',
      });
    } else if (
      !/^arn:aws:lambda:[a-z0-9-]+:\d{12}:function:.+$/.test(data.lambdaArn)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lambdaArn'],
        message: 'Invalid Lambda ARN format',
      });
    }
    if (!data.iamRoleArn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['iamRoleArn'],
        message: 'IAM Role ARN is required',
      });
    } else if (!/^arn:aws:iam::\d{12}:role\/.+$/.test(data.iamRoleArn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['iamRoleArn'],
        message: 'Invalid IAM Role ARN format',
      });
    }
    if (!data.roleExternalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['roleExternalId'],
        message: 'External ID is required',
      });
    }
  } else if (data.provider === 'cloud-run') {
    if (!data.gcpProject)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gcpProject'],
        message: 'GCP Project ID is required',
      });
    if (!data.gcpRegion)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gcpRegion'],
        message: 'GCP Region is required',
      });
    if (!data.gcpWorkerPool)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gcpWorkerPool'],
        message: 'Worker Pool is required',
      });
    if (!data.gcpServiceAccount)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gcpServiceAccount'],
        message: 'Service Account is required',
      });
  }
};

export const createDeploymentSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(100)
      .regex(
        /^[a-z][a-z0-9-]*$/,
        'Must be lowercase, alphanumeric with hyphens',
      ),
    buildId: z.string().min(1, 'Build ID is required'),
    ...providerFields,
    ...scalingFields,
  })
  .superRefine(validateProviderFields);

export const createVersionSchema = z
  .object({
    buildId: z.string().min(1, 'Build ID is required'),
    ...providerFields,
    ...scalingFields,
  })
  .superRefine(validateProviderFields);

export const editVersionSchema = z
  .object({
    ...providerFields,
    ...scalingFields,
  })
  .superRefine(validateProviderFields);

export type CreateDeploymentFormData = z.infer<typeof createDeploymentSchema>;
export type CreateVersionFormData = z.infer<typeof createVersionSchema>;
export type EditVersionFormData = z.infer<typeof editVersionSchema>;

export type ComputeProviderValue = 'lambda' | 'cloud-run';

export type ComputeProviderOption = {
  value: ComputeProviderValue;
  disabled?: boolean;
  disabledReason?: string;
  hidden?: boolean;
};

interface InitialComputeProviderOptions {
  provider?: ComputeProviderValue;
  providers?: readonly ComputeProviderOption[];
}

export const getInitialComputeProvider = ({
  provider,
  providers,
}: InitialComputeProviderOptions = {}): ComputeProviderValue => {
  const configuredProvider = providers?.find(
    (option) => option.value === provider,
  );

  if (
    provider &&
    (!providers || (configuredProvider && !configuredProvider.hidden))
  ) {
    return provider;
  }

  return (
    providers?.find(({ disabled, hidden }) => !disabled && !hidden)?.value ??
    'lambda'
  );
};

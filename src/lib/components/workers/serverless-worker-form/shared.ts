import { z } from 'zod/v3';

import {
  HOURS,
  MILLISECONDS,
  MINUTES,
  parseDuration,
  SECONDS,
} from '$lib/holocene/duration-input/duration-input.svelte';
import {
  buildAgentCoreComputeConfig,
  buildGcpCloudRunComputeConfig,
  buildLambdaComputeConfig,
} from '$lib/services/deployments-service';
import type { ComputeConfig } from '$lib/types/deployments';

import {
  COMPUTE_PROVIDERS,
  type ComputeProviderReleaseStage,
  type ComputeProviderValue,
} from './compute-providers';

const scalingFields = {
  scaleUpCooloffMs: z.number().int().min(0).optional(),
  scaleUpBacklogThreshold: z.number().int().min(0).optional(),
  maxWorkerLifetimeMs: z.number().int().min(0).optional(),
  metricsPollIntervalMs: z.number().int().min(10000).optional(),
};

export const scaleDownStabilizationUnits = [
  HOURS,
  MINUTES,
  SECONDS,
  MILLISECONDS,
];

export const defaultScaleDownStabilization = '90s';

const durationPattern = /^\d+(\.\d+)?s$/;

// `0.1 * 1000` is `100.00000000000001` in binary floating point; round to
// nanosecond precision to strip that noise before testing for whole
// milliseconds, matching what the duration input does when it displays a value.
const stripFloatNoise = (n: number): number => Math.round(n * 1e9) / 1e9;

const durationToMs = (duration: string): number =>
  stripFloatNoise(Number(parseDuration(duration)) * 1000);

export const scaleDownStabilizationToMs = (duration: string): number =>
  Math.round(durationToMs(duration));

export const msToScaleDownStabilization = (ms: number): string =>
  `${ms / 1000}s`;

const scaleDownStabilizationField = z
  .string()
  .refine((val) => durationPattern.test(val), {
    message: 'Enter a duration in seconds, such as 90s',
  })
  .refine((val) => Number.isInteger(durationToMs(val)), {
    message: 'Duration must be a whole number of milliseconds',
  })
  .default(defaultScaleDownStabilization);

// AgentCore takes the Runtime *Endpoint* ARN, not the Runtime ARN: the
// provider parses the runtime id and endpoint name out of it and rejects
// anything else. See parseAgentCoreEndpointARN in temporal-auto-scaled-workers.
const AGENT_CORE_ENDPOINT_ARN =
  /^arn:aws:bedrock-agentcore:[a-z0-9-]+:\d{12}:runtime\/[^/]+\/runtime-endpoint\/[^/]+$/;

const providerFields = {
  provider: z.enum(['lambda', 'agentcore', 'cloud-run']).default('lambda'),
  lambdaArn: z.string().default(''),
  agentCoreEndpointArn: z.string().default(''),
  iamRoleArn: z.string().default(''),
  roleExternalId: z.string().default(''),
  gcpProject: z.string().default(''),
  gcpRegion: z.string().default(''),
  gcpWorkerPool: z.string().default(''),
  gcpServiceAccount: z.string().default(''),
  minReplicas: z.number().int().min(0).max(2_147_483_647).default(0),
  maxReplicas: z.number().int().min(1).max(2_147_483_647).default(30),
  initialReplicas: z.number().int().min(0).max(2_147_483_647).default(0),
  utilizationTarget: z.number().gt(0).max(1).default(0.8),
  scaleDownStabilization: scaleDownStabilizationField,
};

// Lambda and AgentCore are both invoked through an assumed IAM role, so they
// take the same Access fields and validate them identically.
const validateAwsAccessFields = (
  data: z.infer<z.ZodObject<typeof providerFields>>,
  ctx: z.RefinementCtx,
) => {
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
};

const validateProviderFields = (
  data: z.infer<z.ZodObject<typeof providerFields>>,
  ctx: z.RefinementCtx,
) => {
  if (data.provider === 'agentcore') {
    if (!data.agentCoreEndpointArn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['agentCoreEndpointArn'],
        message: 'Agent Runtime Endpoint ARN is required',
      });
    } else if (!AGENT_CORE_ENDPOINT_ARN.test(data.agentCoreEndpointArn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['agentCoreEndpointArn'],
        message: 'Invalid Agent Runtime Endpoint ARN format',
      });
    }
    validateAwsAccessFields(data, ctx);
  } else if (data.provider === 'lambda') {
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
    validateAwsAccessFields(data, ctx);
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
    if (data.minReplicas > data.maxReplicas)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minReplicas'],
        message: 'Min Replicas must be less than or equal to Max Replicas',
      });
    if (
      data.initialReplicas < data.minReplicas ||
      data.initialReplicas > data.maxReplicas
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initialReplicas'],
        message: 'Initial Replicas must be between Min and Max Replicas',
      });
  }
};

const deploymentNameField = z
  .string()
  .min(3, 'Name must be at least 3 characters')
  .max(100)
  .regex(/^[a-z][a-z0-9-]*$/, 'Must be lowercase, alphanumeric with hyphens');

const buildIdField = z.string().min(1, 'Build ID is required');

export const createDeploymentSchema = z
  .object({
    name: deploymentNameField,
    buildId: buildIdField,
    ...providerFields,
    ...scalingFields,
  })
  .superRefine(validateProviderFields);

export const createVersionSchema = z
  .object({
    buildId: buildIdField,
    ...providerFields,
    ...scalingFields,
  })
  .superRefine(validateProviderFields);

// When each region holds its own compute, the form checks only the fields it
// owns. validateRegionValues checks each region's compute.
export const multiRegionCreateDeploymentSchema = z
  .object({ name: deploymentNameField, buildId: buildIdField })
  .passthrough();

export const multiRegionCreateVersionSchema = z
  .object({ buildId: buildIdField })
  .passthrough();

export const multiRegionEditVersionSchema = z.object({}).passthrough();

export const editVersionSchema = z
  .object({
    ...providerFields,
    ...scalingFields,
  })
  .superRefine(validateProviderFields);

export type CreateDeploymentFormData = z.infer<typeof createDeploymentSchema>;
export type CreateVersionFormData = z.infer<typeof createVersionSchema>;
export type EditVersionFormData = z.infer<typeof editVersionSchema>;

export type ComputeFormValues = z.infer<z.ZodObject<typeof providerFields>> &
  Partial<z.infer<z.ZodObject<typeof scalingFields>>>;

/** The compute a highly available Namespace runs in one of its regions. */
export type RegionComputeValues = {
  regionId: string;
  values: ComputeFormValues;
  /**
   * False for the primary, which saves as the unscoped default group: it runs
   * wherever no scoped group matches, as every group did before regions.
   */
  scoped?: boolean;
  /** A problem with the resource that the schema cannot see, such as its region. */
  resourceError?: { field: keyof ComputeFormValues; message: string };
};

export type ComputeFieldErrors = Partial<
  Record<keyof ComputeFormValues, string[]>
>;

/**
 * Validates each region with the same rules as a single-region Version.
 * Returns the field errors of each region that fails, keyed by region.
 */
export const validateRegionValues = (
  entries: readonly RegionComputeValues[],
): Record<string, ComputeFieldErrors> =>
  Object.fromEntries(
    entries.flatMap(({ regionId, values, resourceError }) => {
      const result = editVersionSchema.safeParse(values);
      const errors: ComputeFieldErrors = result.success
        ? {}
        : (result.error.flatten().fieldErrors as ComputeFieldErrors);
      // The schema's own error on the field comes first, e.g. a malformed ARN.
      if (resourceError && !errors[resourceError.field]) {
        errors[resourceError.field] = [resourceError.message];
      }
      return Object.keys(errors).length ? [[regionId, errors]] : [];
    }),
  );

// The single place that maps a provider choice onto a ComputeConfig. Every
// create/edit page routes through here so a new provider is one branch, not a
// ternary in each page.
export const buildComputeConfigFromForm = (
  data: ComputeFormValues,
): ComputeConfig => {
  if (data.provider === 'cloud-run') {
    return buildGcpCloudRunComputeConfig(
      data.gcpProject,
      data.gcpRegion,
      data.gcpWorkerPool,
      data.gcpServiceAccount,
      {
        minReplicas: data.minReplicas,
        maxReplicas: data.maxReplicas,
        initialReplicas: data.initialReplicas,
        utilizationTarget: data.utilizationTarget,
        scaleDownStabilizationMs: scaleDownStabilizationToMs(
          data.scaleDownStabilization,
        ),
      },
    );
  }

  const invokeScaling = {
    roleExternalId: data.roleExternalId,
    scaleUpCooloffMs: data.scaleUpCooloffMs,
    scaleUpBacklogThreshold: data.scaleUpBacklogThreshold,
    maxWorkerLifetimeMs: data.maxWorkerLifetimeMs,
    metricsPollIntervalMs: data.metricsPollIntervalMs,
  };

  if (data.provider === 'agentcore') {
    return buildAgentCoreComputeConfig(
      data.agentCoreEndpointArn,
      data.iamRoleArn,
      invokeScaling,
    );
  }

  return buildLambdaComputeConfig(
    data.lambdaArn,
    data.iamRoleArn,
    invokeScaling,
  );
};

/**
 * One scaling group per Namespace region, for a highly available Namespace.
 *
 * A group per region rather than one group listing several, because the
 * resource is regional: a Lambda ARN names its region, so the two regions
 * cannot share a group even when every other setting matches.
 * `region_ids` is repeated and would allow the shared shape, which is what a
 * provider with a non-regional resource would use.
 *
 * The group takes the region's own identifier as its name. The name is free
 * text as far as the API is concerned and `region_ids` is what actually
 * decides where a group runs, but a map keyed by something meaningful is
 * easier to read in a diff and in an error message than `group-1`.
 */
/** The group a single-region Version saves, and an HA Version's primary. */
export const DEFAULT_SCALING_GROUP = 'default';

export const buildComputeConfigForRegions = (
  entries: readonly RegionComputeValues[],
): ComputeConfig => ({
  scalingGroups: Object.fromEntries(
    entries.map(({ regionId, values, scoped = true }) => {
      // Each provider builder emits exactly one group, which is the group this
      // region needs; only its name and its regions are added here.
      const built = buildComputeConfigFromForm(values);
      const [group] = Object.values(built.scalingGroups ?? {});
      return scoped
        ? [regionId, { ...group, regionIds: [regionId] }]
        : [DEFAULT_SCALING_GROUP, group];
    }),
  ),
});

export type ComputeProviderOption = {
  value: ComputeProviderValue;
  disabled?: boolean;
  disabledReason?: string;
  hidden?: boolean;
  releaseStage?: ComputeProviderReleaseStage;
};

/**
 * Re-exported so the many modules already importing these from here keep
 * working. COMPUTE_PROVIDERS is the source.
 */
export type {
  ComputeProviderReleaseStage,
  ComputeProviderValue,
} from './compute-providers';

/** Stated once, in the registry. Spelled out so the annotation checks every provider. */
export const defaultReleaseStage: Record<
  ComputeProviderValue,
  ComputeProviderReleaseStage
> = {
  lambda: COMPUTE_PROVIDERS.lambda.releaseStage,
  agentcore: COMPUTE_PROVIDERS.agentcore.releaseStage,
  'cloud-run': COMPUTE_PROVIDERS['cloud-run'].releaseStage,
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

interface TerraformTemplateValues {
  externalId?: string;
  lambdaArn?: string;
  /** The Runtime Endpoint ARN, for the AgentCore module's list. */
  agentCoreEndpointArn?: string;
}

/** Rewrites a `key = [...]` list in an HCL snippet with the ARNs given. */
const replaceArnList = (template: string, key: string, value?: string) => {
  const arns = (value ?? '')
    .split(',')
    .map((arn) => arn.trim())
    .filter(Boolean);

  if (!arns.length) return template;

  const entries = arns.map((arn) => `    "${arn}",`).join('\n');

  return template.replace(
    new RegExp(`(${key}\\s*=\\s*\\[)[^\\]]*(\\])`),
    (_, open: string, close: string) => `${open}\n${entries}\n  ${close}`,
  );
};

export const interpolateTerraformTemplate = (
  template: string,
  { externalId, lambdaArn, agentCoreEndpointArn }: TerraformTemplateValues,
): string => {
  let result = template;

  if (externalId) {
    result = result.replace(
      /(external_id\s*=\s*)"[^"]*"/,
      (_, assignment: string) => `${assignment}"${externalId}"`,
    );
  }

  // Only one of these keys exists in a given snippet, so both run and the
  // absent one is a no-op rather than the caller having to say which provider
  // this template belongs to.
  result = replaceArnList(result, 'lambda_function_arns', lambdaArn);
  result = replaceArnList(result, 'agent_runtime_arns', agentCoreEndpointArn);

  return result;
};

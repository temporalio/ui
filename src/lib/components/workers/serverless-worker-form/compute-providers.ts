import type { I18nKey, I18nResources } from '$lib/i18n';
import { IconAwsColor, type IconComponent, IconGcpColor } from '$lib/io/icon';

import defaultAgentCoreTerraform from './serverless-worker-agentcore.tf?raw';
import defaultCloudRunTerraform from './serverless-worker-cloud-run.tf?raw';
import defaultLambdaTerraform from './serverless-worker-lambda.tf?raw';
import defaultAgentCoreCloudFormation from './temporal-agentcore-role.yaml?raw';
import defaultLambdaCloudFormation from './temporal-worker-role.yaml?raw';

/**
 * Everything the UI knows about a compute provider, in one place.
 *
 * This exists because a provider used to be described in ten of them: an icon
 * map and two label switches in the picker, a release stage map in shared.ts, a
 * second icon-and-label map in compute-badge keyed by the wire name, an
 * if-chain normalising those wire names in lock-compute-provider, and five raw
 * template imports resolved through provider ternaries in compute-fields.
 * Adding a provider meant finding all ten.
 *
 * Adding one now means adding an entry here. The Record is exhaustive over
 * ComputeProviderValue, so the compiler names the gap if an entry is missing —
 * including in a consumer that supplies its own templates.
 */

/**
 * The order the picker offers them in. The union is derived from this tuple
 * rather than the other way round, so the list needs no cast to stay in step.
 */
export const COMPUTE_PROVIDER_VALUES = [
  'lambda',
  'agentcore',
  'cloud-run',
] as const;

export type ComputeProviderValue = (typeof COMPUTE_PROVIDER_VALUES)[number];

/** The `providerType` the API uses, as opposed to the short name the UI uses. */
export type ComputeProviderType =
  | 'aws-lambda'
  | 'aws-agentcore'
  | 'gcp-cloud-run';

export type ComputeProviderReleaseStage =
  | 'public-preview'
  | 'pre-release'
  | 'generally-available';

/**
 * The infrastructure templates offered for a provider.
 *
 * CloudFormation is AWS-only, so a GCP provider has none. That asymmetry is
 * modelled rather than filled in with an empty string, so the picker can ask
 * whether a provider has a CloudFormation path instead of inferring it.
 */
export type ComputeProviderTemplates = {
  terraform: string;
  cloudFormation?: {
    template: string;
    /** The name the template downloads as. */
    fileName: string;
    /** A prefilled Launch Stack URL. Deployment-specific, so consumers supply it. */
    url?: string;
  };
};

export type ComputeProviderDefinition = {
  value: ComputeProviderValue;
  providerType: ComputeProviderType;
  /**
   * The brand mark, not a monochrome glyph: it identifies a vendor, so it keeps
   * its own colour on either theme.
   */
  icon: IconComponent;
  /**
   * i18n keys rather than resolved strings, so a locale change re-renders the
   * label instead of freezing whatever was current at module load. Typed as the
   * key union, so a typo is a compile error rather than a label reading
   * "workers.provider-lamda" in the UI.
   */
  labelKey: I18nKey<I18nResources>;
  descriptionKey: I18nKey<I18nResources>;
  /** The compact label for compute-badge, where the full vendor name will not fit. */
  badgeLabel: string;
  releaseStage: ComputeProviderReleaseStage;
  templates: ComputeProviderTemplates;
  /** The published Terraform module, when one exists for the provider. */
  terraformModuleHref?: string;
};

export const TERRAFORM_MODULES =
  'https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers';

export const COMPUTE_PROVIDERS: Record<
  ComputeProviderValue,
  ComputeProviderDefinition
> = {
  lambda: {
    value: 'lambda',
    providerType: 'aws-lambda',
    icon: IconAwsColor,
    labelKey: 'workers.provider-lambda',
    descriptionKey: 'workers.provider-lambda-description',
    badgeLabel: 'Lambda',
    releaseStage: 'public-preview',
    templates: {
      terraform: defaultLambdaTerraform,
      cloudFormation: {
        template: defaultLambdaCloudFormation,
        fileName: 'temporal-worker-role.yaml',
      },
    },
    terraformModuleHref: `${TERRAFORM_MODULES}/aws/lambda`,
  },
  agentcore: {
    value: 'agentcore',
    providerType: 'aws-agentcore',
    icon: IconAwsColor,
    labelKey: 'workers.provider-agentcore',
    descriptionKey: 'workers.provider-agentcore-description',
    badgeLabel: 'AgentCore',
    releaseStage: 'pre-release',
    templates: {
      terraform: defaultAgentCoreTerraform,
      cloudFormation: {
        template: defaultAgentCoreCloudFormation,
        fileName: 'temporal-agentcore-role.yaml',
      },
    },
    terraformModuleHref: `${TERRAFORM_MODULES}/aws/agentcore`,
  },
  'cloud-run': {
    value: 'cloud-run',
    providerType: 'gcp-cloud-run',
    icon: IconGcpColor,
    labelKey: 'workers.provider-cloud-run',
    descriptionKey: 'workers.provider-cloud-run-description',
    badgeLabel: 'Cloud Run',
    releaseStage: 'public-preview',
    templates: {
      // CloudFormation is AWS-only, so Cloud Run offers Terraform alone.
      terraform: defaultCloudRunTerraform,
    },
  },
};

/**
 * The default templates, which a consumer overrides by passing its own map.
 *
 * Written out rather than mapped, because the annotation then makes the
 * compiler name a provider that has no entry. Building it with
 * Object.fromEntries needs a cast, and the cast would suppress exactly the error
 * this exists to raise.
 */
export const defaultComputeProviderTemplates: Record<
  ComputeProviderValue,
  ComputeProviderTemplates
> = {
  lambda: COMPUTE_PROVIDERS.lambda.templates,
  agentcore: COMPUTE_PROVIDERS.agentcore.templates,
  'cloud-run': COMPUTE_PROVIDERS['cloud-run'].templates,
};

// Both spellings appear in the wild: the API sends `aws-lambda`, while some
// stored configs carry the short name.
const BY_PROVIDER_TYPE = new Map<string, ComputeProviderValue>(
  COMPUTE_PROVIDER_VALUES.flatMap((value) => [
    [COMPUTE_PROVIDERS[value].providerType, value] as const,
    [value, value] as const,
  ]),
);

export const computeProviderFromType = (
  type: string | undefined,
): ComputeProviderValue | undefined =>
  type === undefined ? undefined : BY_PROVIDER_TYPE.get(type);

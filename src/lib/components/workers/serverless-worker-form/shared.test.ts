import { describe, expect, it } from 'vitest';

import {
  createDeploymentSchema,
  editVersionSchema,
  getInitialComputeProvider,
  interpolateTerraformTemplate,
} from './shared';

describe('getInitialComputeProvider', () => {
  it('defaults to Lambda when provider configuration is omitted', () => {
    expect(getInitialComputeProvider()).toBe('lambda');
  });

  it('uses the first visible enabled configured provider', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('cloud-run');
  });

  it('ignores hidden providers', () => {
    expect(
      getInitialComputeProvider({
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('falls back to Lambda when no configured provider is selectable', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run', hidden: true },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing visible provider when it is disabled', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing provider when provider configuration is omitted', () => {
    expect(getInitialComputeProvider({ provider: 'cloud-run' })).toBe(
      'cloud-run',
    );
  });

  it('uses the first visible enabled provider when the existing provider is hidden', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('uses the first visible enabled provider when the existing provider is absent', () => {
    expect(
      getInitialComputeProvider({
        provider: 'cloud-run',
        providers: [{ value: 'lambda' }],
      }),
    ).toBe('lambda');
  });
});

describe('Cloud Run replica validation', () => {
  const baseCloudRunData = {
    provider: 'cloud-run' as const,
    lambdaArn: '',
    iamRoleArn: '',
    roleExternalId: '',
    gcpProject: 'test-project',
    gcpRegion: 'us-central1',
    gcpWorkerPool: 'test-pool',
    gcpServiceAccount: 'worker@test-project.iam.gserviceaccount.com',
  };

  it('applies replica defaults', () => {
    const result = editVersionSchema.parse(baseCloudRunData);

    expect(result.minReplicas).toBe(0);
    expect(result.maxReplicas).toBe(30);
    expect(result.initialReplicas).toBe(0);
    expect(result.utilizationTarget).toBe(0.8);
  });

  it.each([
    ['negative minimum', { minReplicas: -1, maxReplicas: 30 }],
    ['zero maximum', { minReplicas: 0, maxReplicas: 0 }],
    ['fractional minimum', { minReplicas: 0.5, maxReplicas: 30 }],
    ['fractional maximum', { minReplicas: 0, maxReplicas: 30.5 }],
    ['maximum above the backend limit', { maxReplicas: 2_147_483_648 }],
    ['minimum above maximum', { minReplicas: 31, maxReplicas: 30 }],
    [
      'initial below minimum',
      { minReplicas: 2, maxReplicas: 30, initialReplicas: 1 },
    ],
    [
      'initial above maximum',
      { minReplicas: 0, maxReplicas: 30, initialReplicas: 31 },
    ],
    ['zero utilization', { utilizationTarget: 0 }],
    ['utilization above one', { utilizationTarget: 1.01 }],
  ])('rejects %s', (_name, replicas) => {
    expect(
      editVersionSchema.safeParse({ ...baseCloudRunData, ...replicas }).success,
    ).toBe(false);
  });

  it('uses the same replica defaults when creating a deployment', () => {
    const result = createDeploymentSchema.parse({
      ...baseCloudRunData,
      name: 'test-deployment',
      buildId: 'v1',
    });

    expect(result).toMatchObject({
      minReplicas: 0,
      maxReplicas: 30,
      initialReplicas: 0,
      utilizationTarget: 0.8,
    });
  });
});

describe('interpolateTerraformTemplate', () => {
  const template = `module "serverless-worker-lambda" {
  source = "terraform-modules/modules/serverless-workers/aws/lambda"

  external_id               = "<external-id>"
  temporal_cloud_principals = "<provided by Temporal Cloud>"

  lambda_function_arns = [
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-1",
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-2",
  ]
}`;

  it('replaces the external id placeholder with the provided value', () => {
    const result = interpolateTerraformTemplate(template, {
      externalId: 'my-external-id',
    });

    expect(result).toContain('external_id               = "my-external-id"');
    expect(result).not.toContain('<external-id>');
  });

  it('replaces the example lambda function ARNs with the provided ARN', () => {
    const arn = 'arn:aws:lambda:us-west-2:093235337669:function:hello-activity';
    const result = interpolateTerraformTemplate(template, { lambdaArn: arn });

    expect(result).toContain(`lambda_function_arns = [\n    "${arn}",\n  ]`);
    expect(result).not.toContain('my-worker-1');
  });

  it('renders comma-separated ARNs as separate list entries', () => {
    const first = 'arn:aws:lambda:us-east-1:093235337669:function:worker-a';
    const second = 'arn:aws:lambda:us-east-1:093235337669:function:worker-b';
    const result = interpolateTerraformTemplate(template, {
      lambdaArn: `${first}, ${second}`,
    });

    expect(result).toContain(
      `lambda_function_arns = [\n    "${first}",\n    "${second}",\n  ]`,
    );
    expect(result).not.toContain('my-worker-1');
  });

  it('ignores empty segments from stray commas and whitespace', () => {
    const arn = 'arn:aws:lambda:us-east-1:093235337669:function:worker-a';
    const result = interpolateTerraformTemplate(template, {
      lambdaArn: ` ${arn}, `,
    });

    expect(result).toContain(`lambda_function_arns = [\n    "${arn}",\n  ]`);
  });

  it('replaces both values together', () => {
    const arn = 'arn:aws:lambda:us-east-1:093235337669:function:surveypoll';
    const result = interpolateTerraformTemplate(template, {
      externalId: 'test',
      lambdaArn: arn,
    });

    expect(result).toContain('external_id               = "test"');
    expect(result).toContain(`"${arn}"`);
    expect(result).not.toContain('<external-id>');
    expect(result).not.toContain('123456789012');
  });

  it('returns the template unchanged when no values are provided', () => {
    expect(interpolateTerraformTemplate(template, {})).toBe(template);
    expect(
      interpolateTerraformTemplate(template, { externalId: '', lambdaArn: '' }),
    ).toBe(template);
  });

  it('does not treat replacement-pattern characters in values specially', () => {
    const result = interpolateTerraformTemplate(template, {
      externalId: "$' $& $1",
    });

    expect(result).toContain('external_id               = "$\' $& $1"');
  });

  it('leaves other principals and comments untouched', () => {
    const result = interpolateTerraformTemplate(template, {
      externalId: 'abc',
      lambdaArn: 'arn:aws:lambda:us-east-1:093235337669:function:f',
    });

    expect(result).toContain(
      'temporal_cloud_principals = "<provided by Temporal Cloud>"',
    );
    expect(result).toContain('source = "terraform-modules/modules');
  });
});

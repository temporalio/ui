import { describe, expect, it } from 'vitest';

import {
  buildComputeConfigFromForm,
  createDeploymentSchema,
  createVersionSchema,
  editVersionSchema,
  getInitialComputeProvider,
  interpolateTerraformTemplate,
  msToScaleDownStabilization,
  scaleDownStabilizationToMs,
} from './shared';

describe('scale-down stabilization conversion', () => {
  it.each([
    ['0s', 0],
    ['0.1s', 100],
    ['90s', 90_000],
    ['300s', 300_000],
  ])('converts %s to %i ms', (duration, ms) => {
    expect(scaleDownStabilizationToMs(duration)).toBe(ms);
  });

  it.each([
    [0, '0s'],
    [100, '0.1s'],
    [90_000, '90s'],
    [300_000, '300s'],
  ])('converts %i ms back to %s', (ms, duration) => {
    expect(msToScaleDownStabilization(ms)).toBe(duration);
  });

  it('round-trips the value the CLI defaults to', () => {
    expect(scaleDownStabilizationToMs(msToScaleDownStabilization(90_000))).toBe(
      90_000,
    );
  });
});

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
    expect(result.scaleDownStabilization).toBe('90s');
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
    ['negative stabilization window', { scaleDownStabilization: '-1s' }],
    [
      'sub-millisecond stabilization window',
      { scaleDownStabilization: '0.0005s' },
    ],
    ['unitless stabilization window', { scaleDownStabilization: '90' }],
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
      scaleDownStabilization: '90s',
    });
  });

  it('accepts a zero stabilization window', () => {
    const result = editVersionSchema.parse({
      ...baseCloudRunData,
      scaleDownStabilization: '0s',
    });

    expect(result.scaleDownStabilization).toBe('0s');
  });

  it('accepts a whole-millisecond stabilization window', () => {
    const result = editVersionSchema.parse({
      ...baseCloudRunData,
      scaleDownStabilization: '0.1s',
    });

    expect(result.scaleDownStabilization).toBe('0.1s');
  });
});

describe('interpolateTerraformTemplate', () => {
  const template = `module "serverless-worker-lambda" {
  source = "terraform-modules/modules/serverless-workers/aws/lambda"

  external_id = "<external-id>"

  # IAM principals allowed to assume this role to invoke your workers.
  temporal_cloud_principals = [
    "<principal-arn>",
  ]

  lambda_function_arns = [
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-1",
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-2",
  ]
}`;

  it('replaces the external id placeholder with the provided value', () => {
    const result = interpolateTerraformTemplate(template, {
      externalId: 'my-external-id',
    });

    expect(result).toContain('external_id = "my-external-id"');
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

    expect(result).toContain('external_id = "test"');
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

    expect(result).toContain('external_id = "$\' $& $1"');
  });

  it('leaves other principals and comments untouched', () => {
    const result = interpolateTerraformTemplate(template, {
      externalId: 'abc',
      lambdaArn: 'arn:aws:lambda:us-east-1:093235337669:function:f',
    });

    expect(result).toContain(
      'temporal_cloud_principals = [\n    "<principal-arn>",\n  ]',
    );
    expect(result).toContain('source = "terraform-modules/modules');
  });
});

describe('AgentCore provider validation', () => {
  const valid = {
    buildId: '1.0.0',
    provider: 'agentcore' as const,
    agentCoreEndpointArn:
      'arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/orders-abc123/runtime-endpoint/DEFAULT',
    iamRoleArn:
      'arn:aws:iam::123456789012:role/Temporal-Cloud-Serverless-Worker',
    roleExternalId: 'tmprl-00000000-0000-0000-0000-000000000000',
  };

  const errorPaths = (data: Record<string, unknown>): string[] => {
    const result = createVersionSchema.safeParse(data);
    if (result.success) return [];
    return result.error.issues.map((issue) => issue.path.join('.'));
  };

  it('accepts a Runtime Endpoint ARN with role and external id', () => {
    expect(createVersionSchema.safeParse(valid).success).toBe(true);
  });

  it('requires the endpoint ARN', () => {
    expect(errorPaths({ ...valid, agentCoreEndpointArn: '' })).toContain(
      'agentCoreEndpointArn',
    );
  });

  // The provider parses the runtime id and endpoint name out of the ARN, so a
  // bare Runtime ARN is rejected rather than silently failing at invoke time.
  it('rejects a Runtime ARN that is not a Runtime Endpoint ARN', () => {
    expect(
      errorPaths({
        ...valid,
        agentCoreEndpointArn:
          'arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/orders-abc123',
      }),
    ).toContain('agentCoreEndpointArn');
  });

  it('requires the IAM role and external id, as Lambda does', () => {
    const paths = errorPaths({ ...valid, iamRoleArn: '', roleExternalId: '' });
    expect(paths).toContain('iamRoleArn');
    expect(paths).toContain('roleExternalId');
  });

  it('does not require Lambda or Cloud Run fields', () => {
    expect(errorPaths(valid)).toEqual([]);
  });
});

describe('Modal provider', () => {
  const valid = {
    buildId: 'v1',
    provider: 'modal' as const,
    modalApp: 'temporal-gpu-workers',
    modalFunction: 'temporal_worker',
  };

  const errorPaths = (data: Record<string, unknown>): string[] => {
    const result = createVersionSchema.safeParse(data);
    if (result.success) return [];
    return result.error.issues.map((issue) => issue.path.join('.'));
  };

  const detailsOf = (config: ReturnType<typeof buildComputeConfigFromForm>) => {
    const group = config.scalingGroups?.default;
    const decode = (data?: string) =>
      data ? JSON.parse(atob(data)) : undefined;
    return {
      providerType: group?.provider?.type,
      provider: decode(group?.provider?.details?.data),
      scalerType: group?.scaler?.type,
      scaler: decode(group?.scaler?.details?.data),
    };
  };

  it('accepts an app and a function', () => {
    expect(createVersionSchema.safeParse(valid).success).toBe(true);
  });

  it('requires both the app and the function', () => {
    const paths = errorPaths({ ...valid, modalApp: '', modalFunction: '' });
    expect(paths).toContain('modalApp');
    expect(paths).toContain('modalFunction');
  });

  // Modal is invoked with the Service's own Modal token, so there is no role
  // to assume and none of the AWS or GCP fields apply.
  it('does not require access or other providers\u2019 fields', () => {
    expect(errorPaths(valid)).toEqual([]);
  });

  it('builds a modal provider paired with the no-sync scaler', () => {
    const built = detailsOf(
      buildComputeConfigFromForm({
        ...createVersionSchema.parse(valid),
        scaleUpCooloffMs: 250,
      }),
    );

    expect(built.providerType).toBe('modal');
    expect(built.provider).toEqual({
      app: 'temporal-gpu-workers',
      function: 'temporal_worker',
    });
    expect(built.scalerType).toBe('no-sync');
    expect(built.scaler).toEqual({ scale_up_cooloff_ms: 250 });
  });

  // Anything the provider does not claim for itself is forwarded to the Modal
  // function as a keyword argument, which is how the worker learns its queue.
  it('passes the optional worker settings through as provider details', () => {
    const built = detailsOf(
      buildComputeConfigFromForm(
        createVersionSchema.parse({
          ...valid,
          modalEnvironment: 'compute-testing',
          modalTaskQueue: 'gpu-render',
          modalWorkerAddress: '8.tcp.ngrok.io:14688',
        }),
      ),
    );

    expect(built.provider).toEqual({
      app: 'temporal-gpu-workers',
      function: 'temporal_worker',
      environment: 'compute-testing',
      task_queue: 'gpu-render',
      server_address: '8.tcp.ngrok.io:14688',
    });
  });

  it('omits the optional details when they are blank', () => {
    const built = detailsOf(
      buildComputeConfigFromForm(createVersionSchema.parse(valid)),
    );

    expect(Object.keys(built.provider)).toEqual(['app', 'function']);
  });
});

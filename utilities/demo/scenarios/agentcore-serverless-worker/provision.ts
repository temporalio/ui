import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { $ } from 'zx';

import type { Logger } from '../../paths';
import { failure } from '../../remedy';

const HERE = dirname(fileURLToPath(import.meta.url));

/** Deterministic names, so provisioning twice reuses rather than multiplies. */
export const NAMES = {
  repository: 'temporal-demo-agentcore',
  role: 'TemporalDemoAgentCoreExecution',
  runtime: 'temporal_demo_agentcore',
  endpoint: 'DEFAULT',
  tag: 'demo',
} as const;

export type ProvisionResult = {
  endpointArn: string;
  /** Resources this run created, as teardown commands. Empty when all reused. */
  created: string[];
  reused: boolean;
};

/**
 * What provisioning needs, and how to get it.
 *
 * A permission error from the AWS CLI names the action but not the policy that
 * grants it, and the ECR managed policies are the awkward case: they are named
 * AmazonEC2ContainerRegistry*, so searching the console for "ecr" finds
 * nothing. That costs a person real time, so the guidance says it.
 */
const SETUP_GUIDANCE = [
  'Attach to the calling identity:',
  '  - BedrockAgentCoreFullAccess (search "AgentCore" in the IAM policy list)',
  '  - AmazonEC2ContainerRegistryFullAccess — search "ContainerRegistry", NOT "ecr":',
  '    the ECR managed policies do not contain the string "ecr" in their names.',
  '  - IAM permissions to create the execution role and pass it to AgentCore:',
  '    iam:CreateRole, iam:PutRolePolicy, iam:GetRole, iam:PassRole.',
  'Or, if you would rather not grant these, ask someone for a Runtime Endpoint',
  'ARN and set AGENTCORE_ENDPOINT_ARN instead of turning provision on.',
];

const probe = async (command: string, args: readonly string[]) =>
  await $`${command} ${args}`.quiet().nothrow();

/**
 * Checks the calling identity can do each part of provisioning before any of
 * it starts, so a half-provisioned account is not the outcome of a missing
 * permission.
 */
export const checkProvisioningAccess = async (region: string) => {
  const missing: string[] = [];

  const docker = await probe('docker', [
    'version',
    '--format',
    '{{.Server.Version}}',
  ]);

  if (docker.exitCode !== 0) {
    missing.push(
      'docker cannot reach a running daemon, and the Worker image has to be built and pushed.',
    );
  }

  const identity = await probe('aws', [
    'sts',
    'get-caller-identity',
    '--output',
    'json',
  ]);

  if (identity.exitCode !== 0) {
    throw failure({
      attempting: 'No usable AWS credentials, so nothing can be provisioned.',
      reported: identity.stderr || identity.stdout,
      fixes: [
        'Configure credentials: aws configure, or set AWS_PROFILE.',
        'Then confirm with: aws sts get-caller-identity',
      ],
    });
  }

  const account = (JSON.parse(identity.stdout) as { Account: string }).Account;

  const agentcore = await probe('aws', [
    'bedrock-agentcore-control',
    'list-agent-runtimes',
    '--region',
    region,
    '--output',
    'json',
  ]);

  if (agentcore.exitCode !== 0) {
    missing.push(
      'bedrock-agentcore is denied: cannot list, create, or invoke agent runtimes.',
    );
  }

  const ecr = await probe('aws', [
    'ecr',
    'describe-repositories',
    '--region',
    region,
    '--output',
    'json',
  ]);

  if (ecr.exitCode !== 0) {
    missing.push('ecr is denied: the Worker image cannot be pushed.');
  }

  if (missing.length) {
    throw failure({
      attempting: `The AWS identity for account ${account} cannot provision an AgentCore runtime in ${region}.`,
      reported: missing.join('\n'),
      fixes: SETUP_GUIDANCE,
      seeAlso: [
        'aws sts get-caller-identity',
        `aws bedrock-agentcore-control list-agent-runtimes --region ${region}`,
      ],
    });
  }

  return { account };
};

const runtimeEndpointArn = (
  region: string,
  account: string,
  runtimeId: string,
) =>
  `arn:aws:bedrock-agentcore:${region}:${account}:runtime/${runtimeId}/runtime-endpoint/${NAMES.endpoint}`;

/** An existing runtime with our name, if provisioning already ran once. */
const existingRuntimeId = async (
  region: string,
): Promise<string | undefined> => {
  const listed = await probe('aws', [
    'bedrock-agentcore-control',
    'list-agent-runtimes',
    '--region',
    region,
    '--output',
    'json',
  ]);

  if (listed.exitCode !== 0) return undefined;

  const runtimes = (
    JSON.parse(listed.stdout) as {
      agentRuntimes?: { agentRuntimeName?: string; agentRuntimeId?: string }[];
    }
  ).agentRuntimes;

  return runtimes?.find(
    ({ agentRuntimeName }) => agentRuntimeName === NAMES.runtime,
  )?.agentRuntimeId;
};

/**
 * Creates what the scenario needs and returns the endpoint ARN, reusing
 * anything already present under the same name.
 *
 * Nothing is torn down afterwards. A scenario's shutdown gets a three second
 * grace, which is not enough to delete a runtime, and a reviewer wants the
 * demo to still exist when the run ends. The runtime bills while it exists, so
 * the teardown commands are returned and reported rather than left implicit.
 */
export const provisionAgentCore = async (
  region: string,
  log: Logger,
): Promise<ProvisionResult> => {
  const { account } = await checkProvisioningAccess(region);
  const created: string[] = [];

  const alreadyThere = await existingRuntimeId(region);

  if (alreadyThere) {
    log(`Reusing AgentCore runtime ${alreadyThere} from a previous provision`);

    return {
      endpointArn: runtimeEndpointArn(region, account, alreadyThere),
      created: [],
      reused: true,
    };
  }

  const registry = `${account}.dkr.ecr.${region}.amazonaws.com`;
  const imageUri = `${registry}/${NAMES.repository}:${NAMES.tag}`;

  log(`Creating ECR repository ${NAMES.repository}`);

  const repo = await probe('aws', [
    'ecr',
    'create-repository',
    '--repository-name',
    NAMES.repository,
    '--region',
    region,
    '--output',
    'json',
  ]);

  if (repo.exitCode === 0) {
    created.push(
      `aws ecr delete-repository --repository-name ${NAMES.repository} --region ${region} --force`,
    );
  }

  log('Building and pushing the Worker image for linux/arm64');

  const login = await $`aws ecr get-login-password --region ${region}`
    .quiet()
    .nothrow();

  if (login.exitCode !== 0) {
    throw failure({
      attempting:
        'Could not obtain an ECR login token, so the image cannot be pushed.',
      reported: login.stderr,
      fixes: ['ecr:GetAuthorizationToken is required.', ...SETUP_GUIDANCE],
    });
  }

  const dockerLogin =
    await $`echo ${login.stdout.trim()} | docker login --username AWS --password-stdin ${registry}`
      .quiet()
      .nothrow();

  if (dockerLogin.exitCode !== 0) {
    throw failure({
      attempting: `docker could not authenticate to ${registry}.`,
      reported: dockerLogin.stderr,
      fixes: ['Confirm the docker daemon is running: docker version'],
    });
  }

  // AgentCore Runtime only accepts arm64 images.
  const build =
    await $`docker build --platform linux/arm64 -t ${imageUri} ${join(HERE, 'worker')}`
      .quiet()
      .nothrow();

  if (build.exitCode !== 0) {
    throw failure({
      attempting: 'Could not build the Worker image.',
      reported: build.stderr || build.stdout,
      fixes: [
        'The build needs to emit linux/arm64; AgentCore rejects amd64 images.',
        'On an amd64 host this needs emulation: docker buildx and qemu.',
      ],
      seeAlso: [join(HERE, 'worker', 'Dockerfile')],
    });
  }

  const push = await $`docker push ${imageUri}`.quiet().nothrow();

  if (push.exitCode !== 0) {
    throw failure({
      attempting: `Could not push ${imageUri}.`,
      reported: push.stderr || push.stdout,
      fixes: [
        'ecr:PutImage and the layer upload actions are required.',
        ...SETUP_GUIDANCE,
      ],
    });
  }

  log(`Creating execution role ${NAMES.role}`);

  const trust = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'bedrock-agentcore.amazonaws.com' },
        Action: 'sts:AssumeRole',
        Condition: {
          StringEquals: { 'aws:SourceAccount': account },
          ArnLike: {
            'aws:SourceArn': `arn:aws:bedrock-agentcore:${region}:${account}:*`,
          },
        },
      },
    ],
  });

  const permissions = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PullWorkerImage',
        Effect: 'Allow',
        Action: [
          'ecr:BatchGetImage',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchCheckLayerAvailability',
        ],
        Resource: `arn:aws:ecr:${region}:${account}:repository/${NAMES.repository}`,
      },
      {
        Sid: 'EcrAuth',
        Effect: 'Allow',
        Action: 'ecr:GetAuthorizationToken',
        Resource: '*',
      },
      {
        Sid: 'Logs',
        Effect: 'Allow',
        Action: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
          'logs:DescribeLogStreams',
        ],
        Resource: `arn:aws:logs:${region}:${account}:log-group:/aws/bedrock-agentcore/*`,
      },
    ],
  });

  const role = await probe('aws', [
    'iam',
    'create-role',
    '--role-name',
    NAMES.role,
    '--assume-role-policy-document',
    trust,
    '--output',
    'json',
  ]);

  if (role.exitCode === 0) {
    created.push(
      `aws iam delete-role-policy --role-name ${NAMES.role} --policy-name worker-runtime`,
    );
    created.push(`aws iam delete-role --role-name ${NAMES.role}`);
  }

  await probe('aws', [
    'iam',
    'put-role-policy',
    '--role-name',
    NAMES.role,
    '--policy-name',
    'worker-runtime',
    '--policy-document',
    permissions,
  ]);

  const roleArn = `arn:aws:iam::${account}:role/${NAMES.role}`;

  log(`Creating AgentCore runtime ${NAMES.runtime}`);

  // A role created moments ago is not always visible to the service yet, and
  // the resulting error blames ECR permissions rather than propagation, which
  // sends the reader to the wrong place. Retrying costs seconds.
  let runtimeId: string | undefined;
  let lastError = '';

  for (let attempt = 0; attempt < 6 && !runtimeId; attempt += 1) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, 10_000));

    const runtime = await probe('aws', [
      'bedrock-agentcore-control',
      'create-agent-runtime',
      '--region',
      region,
      '--agent-runtime-name',
      NAMES.runtime,
      '--role-arn',
      roleArn,
      '--network-configuration',
      JSON.stringify({ networkMode: 'PUBLIC' }),
      '--agent-runtime-artifact',
      JSON.stringify({ containerConfiguration: { containerUri: imageUri } }),
      '--output',
      'json',
    ]);

    if (runtime.exitCode === 0) {
      runtimeId = (JSON.parse(runtime.stdout) as { agentRuntimeId?: string })
        .agentRuntimeId;
      break;
    }

    lastError = runtime.stderr || runtime.stdout;
    if (attempt === 0)
      log('Waiting for the new IAM role to propagate, then retrying');
  }

  if (!runtimeId) {
    throw failure({
      attempting: `Could not create AgentCore runtime ${NAMES.runtime}.`,
      reported: lastError,
      fixes: [
        'An ECR permission error here is usually IAM propagation: the execution role was created seconds ago. This already retries for a minute.',
        'Otherwise the execution role genuinely cannot pull the image; check its worker-runtime policy names the right repository.',
        ...SETUP_GUIDANCE,
      ],
      seeAlso: created.length
        ? ['Created before failing, remove with:', ...created]
        : [],
    });
  }

  created.push(
    `aws bedrock-agentcore-control delete-agent-runtime --region ${region} --agent-runtime-id ${runtimeId}`,
  );

  return {
    endpointArn: runtimeEndpointArn(region, account, runtimeId),
    created,
    reused: false,
  };
};

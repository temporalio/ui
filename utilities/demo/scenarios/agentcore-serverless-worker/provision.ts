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
  /**
   * Distinct from `role`. That one is handed to AgentCore so it can pull the
   * image; this one is assumed by whatever runs the Worker Controller so it
   * can invoke the runtime. Different trust, different permissions.
   */
  invokeRole: 'TemporalDemoAgentCoreInvoke',
  runtime: 'temporal_demo_agentcore',
  endpoint: 'DEFAULT',
  tag: 'demo',
} as const;

export type ProvisionResult = {
  endpointArn: string;
  /** Resources this run created, as teardown commands. Empty when all reused. */
  created: string[];
  reused: boolean;
  /**
   * Whether the runtime already carries this run's environment. Always false
   * today: AgentCore only applies an environment through update, so the caller
   * sets it either way. Kept so a future create that honours the environment
   * can skip the update.
   */
  environmentApplied: boolean;
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
  '  - IAM permissions to create the execution and invoke roles, and to pass',
  '    the execution role to AgentCore: iam:CreateRole, iam:PutRolePolicy,',
  '    iam:GetRole, iam:PassRole, iam:UpdateAssumeRolePolicy.',
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

/**
 * Whether the runtime a given endpoint ARN names still exists.
 *
 * An ARN is a string, so having one says nothing about whether it resolves. A
 * runtime that was deleted, or that lives in another account or region, leaves
 * an ARN behind that looks entirely valid.
 */
export const runtimeExists = async (
  region: string,
  runtimeId: string,
): Promise<{ exists: boolean; reported?: string }> => {
  const got = await probe('aws', [
    'bedrock-agentcore-control',
    'get-agent-runtime',
    '--region',
    region,
    '--agent-runtime-id',
    runtimeId,
    '--output',
    'json',
  ]);

  if (got.exitCode === 0) return { exists: true };

  return { exists: false, reported: got.stderr || got.stdout };
};

/**
 * Waits for a runtime to leave CREATING.
 *
 * create-agent-runtime returns as soon as the request is accepted, and the
 * service rejects both updates and invokes until the runtime is ready. Without
 * this the next call fails with a ConflictException, and whether it does is a
 * matter of how fast the rest of the run is.
 */
const waitForRuntime = async (
  region: string,
  runtimeId: string,
  log: Logger,
  timeoutMs = 300_000,
) => {
  const deadline = Date.now() + timeoutMs;
  let announced = false;

  while (Date.now() < deadline) {
    const got = await probe('aws', [
      'bedrock-agentcore-control',
      'get-agent-runtime',
      '--region',
      region,
      '--agent-runtime-id',
      runtimeId,
      '--output',
      'json',
    ]);

    if (got.exitCode === 0) {
      const status = (JSON.parse(got.stdout) as { status?: string }).status;

      if (status === 'READY') return;

      if (status && /FAILED|DELET/.test(status)) {
        throw failure({
          attempting: `AgentCore runtime ${runtimeId} reached ${status}, so no Worker can start from it.`,
          fixes: [
            'A CREATE_FAILED runtime usually cannot pull its image; check the execution role can read the ECR repository.',
          ],
          seeAlso: [
            `aws bedrock-agentcore-control get-agent-runtime --region ${region} --agent-runtime-id ${runtimeId}`,
          ],
        });
      }

      if (!announced) {
        log(`Waiting for runtime ${runtimeId} to become ready`);
        announced = true;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  throw failure({
    attempting: `AgentCore runtime ${runtimeId} did not become ready within ${timeoutMs}ms.`,
    seeAlso: [
      `aws bedrock-agentcore-control get-agent-runtime --region ${region} --agent-runtime-id ${runtimeId}`,
    ],
  });
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

export type InvokeRole = {
  roleArn: string;
  externalId: string;
  /** Teardown commands for what this call created. Empty when it all existed. */
  created: string[];
};

/**
 * The role Temporal assumes to invoke the runtime.
 *
 * `require_role_and_external_id: false` makes the role optional, not ignored:
 * a compute config that carries one is a config the server will assume. The
 * CLI can leave it out with --aws-agentcore-skip-role-and-external-id, but the
 * form requires both fields and always sends them, so driving the UI needs a
 * role that genuinely assumes rather than a placeholder.
 *
 * Self-hosted differs from Cloud here. Cloud assumes the customer's role, so
 * the trust policy names temporal.io. Here the caller is whoever runs the
 * server, so the trust policy names this account and leans on the external ID
 * to stop a bare account principal from being an open door.
 */
export const ensureInvokeRole = async (
  region: string,
  externalId: string,
  log: Logger,
): Promise<InvokeRole> => {
  const { account } = await checkProvisioningAccess(region);
  const created: string[] = [];
  const roleArn = `arn:aws:iam::${account}:role/${NAMES.invokeRole}`;

  const trust = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: `arn:aws:iam::${account}:root` },
        Action: 'sts:AssumeRole',
        Condition: { StringEquals: { 'sts:ExternalId': externalId } },
      },
    ],
  });

  const permissions = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'InvokeAgentCoreRuntime',
        Effect: 'Allow',
        Action: [
          'bedrock-agentcore:InvokeAgentRuntime',
          'bedrock-agentcore:GetAgentRuntimeEndpoint',
          'bedrock-agentcore:GetAgentRuntime',
        ],
        Resource: [
          `arn:aws:bedrock-agentcore:${region}:${account}:runtime/*`,
          `arn:aws:bedrock-agentcore:${region}:${account}:runtime/*/runtime-endpoint/*`,
        ],
      },
    ],
  });

  log(`Ensuring invoke role ${NAMES.invokeRole}`);

  const role = await probe('aws', [
    'iam',
    'create-role',
    '--role-name',
    NAMES.invokeRole,
    '--assume-role-policy-document',
    trust,
    '--output',
    'json',
  ]);

  if (role.exitCode === 0) {
    created.push(
      `aws iam delete-role-policy --role-name ${NAMES.invokeRole} --policy-name invoke-agentcore`,
    );
    created.push(`aws iam delete-role --role-name ${NAMES.invokeRole}`);
  } else {
    // Already there from an earlier run. The external ID is what the trust
    // policy turns on, so it is rewritten rather than assumed to still match.
    const updated = await probe('aws', [
      'iam',
      'update-assume-role-policy',
      '--role-name',
      NAMES.invokeRole,
      '--policy-document',
      trust,
    ]);

    if (updated.exitCode !== 0) {
      throw failure({
        attempting: `Could not reuse the invoke role ${NAMES.invokeRole}.`,
        reported: updated.stderr || updated.stdout || role.stderr,
        fixes: [
          'The role exists but its trust policy could not be rewritten, so the external ID this run uses may not be the one it trusts.',
          'iam:UpdateAssumeRolePolicy is what this needs, on top of the permissions provisioning already asks for.',
          `Deleting it lets the next run recreate it: aws iam delete-role-policy --role-name ${NAMES.invokeRole} --policy-name invoke-agentcore && aws iam delete-role --role-name ${NAMES.invokeRole}`,
        ],
        seeAlso: [`aws iam get-role --role-name ${NAMES.invokeRole}`],
      });
    }
  }

  const policy = await probe('aws', [
    'iam',
    'put-role-policy',
    '--role-name',
    NAMES.invokeRole,
    '--policy-name',
    'invoke-agentcore',
    '--policy-document',
    permissions,
  ]);

  if (policy.exitCode !== 0) {
    throw failure({
      attempting: `Could not attach invoke permissions to ${NAMES.invokeRole}.`,
      reported: policy.stderr || policy.stdout,
      fixes: [
        'iam:PutRolePolicy is what this needs.',
        'Without it the role exists but cannot invoke the runtime, and the Version fails later with an AccessDenied that names bedrock-agentcore rather than IAM.',
      ],
      seeAlso: [
        `aws iam get-role-policy --role-name ${NAMES.invokeRole} --policy-name invoke-agentcore`,
      ],
    });
  }

  // A role is not assumable the instant it is created, and the server tries
  // seconds later when the form is submitted. Waiting here turns what would
  // surface as an AccessDenied on the Version into a wait nobody notices.
  // Proving it with the real call, external ID and all, is also what catches a
  // trust policy that does not say what this run needs.
  await waitUntilAssumable(roleArn, externalId, log);

  return { roleArn, externalId, created };
};

/** Polls sts:AssumeRole until the role answers to it, or gives up saying so. */
const waitUntilAssumable = async (
  roleArn: string,
  externalId: string,
  log: Logger,
  timeoutMs = 120_000,
) => {
  const deadline = Date.now() + timeoutMs;
  let reported = '';

  while (Date.now() < deadline) {
    const attempt = await probe('aws', [
      'sts',
      'assume-role',
      '--role-arn',
      roleArn,
      '--role-session-name',
      'temporal-demo-preflight',
      '--external-id',
      externalId,
      '--output',
      'json',
    ]);

    if (attempt.exitCode === 0) return;

    reported = attempt.stderr || attempt.stdout;

    log('Waiting for the invoke role to become assumable');
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  throw failure({
    attempting: `The invoke role ${roleArn} never became assumable.`,
    reported,
    fixes: [
      'IAM is eventually consistent, so a role created moments ago is briefly not assumable. This waited two minutes, which is longer than that normally takes.',
      'An AccessDenied that persists is usually the caller lacking sts:AssumeRole on this role, or a service control policy denying it.',
      `The trust policy has to enforce the external ID this run uses: ${externalId}.`,
    ],
    seeAlso: [
      `aws iam get-role --role-name ${NAMES.invokeRole} --query Role.AssumeRolePolicyDocument`,
      `aws sts assume-role --role-arn ${roleArn} --role-session-name probe --external-id ${externalId}`,
    ],
  });
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

    await waitForRuntime(region, alreadyThere, log);

    return {
      endpointArn: runtimeEndpointArn(region, account, alreadyThere),
      created: [],
      reused: true,
      // Whatever a previous run set is on it, so the caller must update it.
      environmentApplied: false,
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

  await waitForRuntime(region, runtimeId, log);

  return {
    endpointArn: runtimeEndpointArn(region, account, runtimeId),
    created,
    reused: false,
    // create-agent-runtime accepts --environment-variables and then ignores
    // it: the runtime comes back with environmentVariables null and the Worker
    // starts with an empty TEMPORAL_ADDRESS. Only update applies an
    // environment, so the caller always has to set it. Waiting for READY above
    // is what stops that update racing the runtime's CREATING state, which is
    // the real fix for the ConflictException.
    environmentApplied: false,
  };
};

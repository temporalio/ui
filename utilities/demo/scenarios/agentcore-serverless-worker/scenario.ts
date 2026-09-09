import { Client, Connection } from '@temporalio/client';
import { z } from 'zod';
import { $ } from 'zx';

import { resolveCli } from './cli';
import {
  checkProvisioningAccess,
  provisionAgentCore,
  runtimeExists,
} from './provision';
import { failure } from '../../remedy';
import type { Scenario, ScenarioContext, ScenarioResult } from '../../scenario';

/** The options this scenario accepts, checked by the compiler in definition.ts. */
export type Options = z.input<typeof optionsSchema>;

// strict, so an option this scenario does not have is an error rather than a
// default used quietly.
const optionsSchema = z.strictObject({
  /**
   * The Bedrock AgentCore Runtime *Endpoint* ARN, four parts:
   * runtime/<id>/runtime-endpoint/<name>. The provider parses the runtime id
   * and endpoint name out of it, so a bare Runtime ARN is rejected. Empty
   * means read AGENTCORE_ENDPOINT_ARN from the environment.
   */
  endpointArn: z.string().default(''),
  /**
   * Create the AgentCore runtime when no endpoint ARN is given, rather than
   * refusing. Off by default because an AgentCore runtime bills while it
   * exists, and starting a demo should not create billable cloud resources by
   * surprise. Provisioning is idempotent by name, so turning this on for
   * repeated runs reuses one runtime rather than adding another.
   */
  provision: z.boolean().default(false),
  region: z.string().default('us-west-2'),
  deploymentName: z.string().default('agentcore-demo'),
  buildId: z.string().default(''),
  taskQueue: z.string().default('agentcore-tq'),
  /** Registered by the Worker the AgentCore session starts. */
  workflowType: z.string().default('Greet'),
  workflowInput: z.unknown().default('demo'),
  /**
   * Point the runtime's TEMPORAL_ADDRESS at this run's tunnel before creating
   * the Version. The tunnel hostname changes per run, so a runtime configured
   * once goes stale; turn this off only when something else keeps it current.
   */
  updateRuntimeAddress: z.boolean().default(true),
  runtimeReadyTimeoutMs: z.number().int().default(300_000),
  workflowTimeoutMs: z.number().int().default(120_000),
});

const ENDPOINT_ARN =
  /^arn:aws:bedrock-agentcore:[a-z0-9-]+:\d{12}:runtime\/([^/]+)\/runtime-endpoint\/([^/]+)$/;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits for the endpoint to serve the version an update just created. */
const waitForEndpoint = async (
  region: string,
  runtimeId: string,
  endpointName: string,
  timeoutMs: number,
  log: ScenarioContext['log'],
) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result =
      await $`aws bedrock-agentcore-control get-agent-runtime-endpoint --region ${region} --agent-runtime-id ${runtimeId} --endpoint-name ${endpointName} --output json`
        .quiet()
        .nothrow();

    if (result.exitCode === 0) {
      const status = (JSON.parse(result.stdout) as { status?: string }).status;

      if (status === 'READY') return;

      if (status && /FAILED|DELET/.test(status)) {
        throw new Error(
          `AgentCore endpoint ${endpointName} is ${status}, so no Worker can start.`,
        );
      }

      log(`AgentCore endpoint ${endpointName} is ${status ?? 'unknown'}`);
    }

    await sleep(10_000);
  }

  throw new Error(
    `AgentCore endpoint ${endpointName} was not READY within ${timeoutMs}ms.`,
  );
};

/**
 * Where the endpoint ARN comes from, and whether provisioning may create one.
 * Shared by preflight and run so they cannot disagree about what this needs.
 */
const resolveSource = (raw: Record<string, unknown>) => {
  const options = optionsSchema.parse(raw);

  return {
    options,
    endpointArn:
      options.endpointArn || process.env.AGENTCORE_ENDPOINT_ARN || '',
    provision: options.provision || process.env.AGENTCORE_PROVISION === '1',
  };
};

const malformedEndpoint = (endpointArn: string, region: string) =>
  failure({
    attempting: `"${endpointArn}" is not a Runtime Endpoint ARN, so the provider cannot resolve a runtime from it.`,
    fixes: [
      'Use the four-part form: arn:aws:bedrock-agentcore:<region>:<account>:runtime/<id>/runtime-endpoint/<name>.',
      'A bare Runtime ARN is the usual mistake. The provider parses the runtime id and endpoint name out of this value, so it needs the endpoint suffix.',
    ],
    seeAlso: [
      `aws bedrock-agentcore-control list-agent-runtime-endpoints --region ${region} --agent-runtime-id <runtime-id>`,
    ],
  });

const missingEndpoint = () =>
  failure({
    attempting:
      'This scenario needs a Bedrock AgentCore Runtime endpoint to invoke, and none was given.',
    fixes: [
      'Set AGENTCORE_ENDPOINT_ARN to a Runtime Endpoint ARN, or endpointArn in the definition.',
      'Or let this scenario create one: AGENTCORE_PROVISION=1 for a single run, or provision: true in the definition. It needs AWS credentials that can use bedrock-agentcore, ECR, and IAM, and will name the exact policies if any are missing.',
    ],
    seeAlso: [
      'Provision is off by default because an AgentCore runtime bills while it exists, and a demo should not create billable cloud resources by surprise.',
      '"Provisioning the AgentCore runtime" in utilities/demo/README.md',
    ],
  });

export const scenario: Scenario = {
  describe:
    'Creates a Worker Deployment Version whose compute provider is Bedrock AgentCore, lets the Worker Controller invoke it, and runs a workflow on the Worker that starts inside the AgentCore session.',

  async preflight(raw) {
    const { options, endpointArn, provision } = resolveSource(raw);

    if (!endpointArn && !provision) throw missingEndpoint();

    // Prove the AWS access provisioning needs before a server build, not
    // after one.
    if (!endpointArn && provision) {
      await checkProvisioningAccess(options.region);

      return;
    }

    const parsed = ENDPOINT_ARN.exec(endpointArn);

    if (!parsed) throw malformedEndpoint(endpointArn, options.region);

    // An ARN is a string, so having one proves nothing about whether it
    // resolves. Checking here rather than in run means a stale one costs
    // seconds instead of a server build and a tunnel.
    const [, runtimeId] = parsed;
    const { exists, reported } = await runtimeExists(options.region, runtimeId);

    if (!exists) {
      throw failure({
        attempting: `The AgentCore runtime "${runtimeId}" named by the endpoint ARN does not exist in ${options.region}, so there is nothing for the Worker Controller to invoke.`,
        reported,
        fixes: [
          'If this came from a previous run, the runtime has since been deleted. Unset AGENTCORE_ENDPOINT_ARN, and this scenario will provision a fresh one when AGENTCORE_PROVISION=1 or provision: true.',
          'An explicit endpoint ARN takes precedence over provisioning, so a stale one in the environment quietly shadows it.',
          `If the runtime is real, check the region: it must match the one inside the ARN, which reads ${options.region}.`,
        ],
        seeAlso: [
          `aws bedrock-agentcore-control list-agent-runtimes --region ${options.region}`,
          'echo $AGENTCORE_ENDPOINT_ARN',
        ],
      });
    }
  },

  async run(context: ScenarioContext, raw): Promise<ScenarioResult> {
    const { options, endpointArn: given, provision } = resolveSource(raw);
    const { log, namespace } = context;

    // Before anything is created. Provisioning bills, and a run without the
    // tunnel cannot finish, so failing here costs nothing while failing after
    // provisioning leaves resources behind for a run that never had a chance.
    if (!context.publicAddress) {
      throw failure({
        attempting: 'This scenario needs the tunnel stage, and it did not run.',
        fixes: [
          'Set tunnel.enabled in the definition.',
          'If you passed --skip tunnel or --only, include the tunnel stage.',
        ],
        seeAlso: [
          'The Worker runs inside AgentCore in AWS and dials the frontend back to poll. That inbound leg is the one thing a dev server on localhost cannot offer; the outbound leg to AWS is never the problem.',
        ],
      });
    }

    const teardown: string[] = [];
    let endpointArn = given;
    // What the Worker inside AgentCore needs in order to reach this run.
    const workerEnvironment = {
      TEMPORAL_ADDRESS: context.publicAddress,
      TEMPORAL_NAMESPACE: namespace,
      TEMPORAL_TASK_QUEUE: options.taskQueue,
    };
    // A runtime created just now already carries the environment above, so
    // there is nothing to point at anything.
    let environmentApplied = false;

    if (!endpointArn && provision) {
      log(
        'No endpoint ARN given, so provisioning one. An AgentCore runtime bills while it exists; the summary lists what was created and how to remove it.',
      );

      const provisioned = await provisionAgentCore(
        options.region,
        workerEnvironment,
        log,
      );

      endpointArn = provisioned.endpointArn;
      teardown.push(...provisioned.created);
      environmentApplied = provisioned.environmentApplied;

      if (provisioned.reused) {
        log('Reused an AgentCore runtime a previous run provisioned');
      }
    }

    if (!endpointArn) throw missingEndpoint();

    const parsed = ENDPOINT_ARN.exec(endpointArn);

    if (!parsed) throw malformedEndpoint(endpointArn, options.region);

    const [, runtimeId, endpointName] = parsed;

    const observations: string[] = [];
    const buildId = options.buildId || `run-${Date.now()}`;
    // PATH may hold a CLI older than the agentcore flags, so this is resolved
    // rather than assumed.
    const cli = await resolveCli();

    log(`Using Temporal CLI at ${cli}`);

    if (options.updateRuntimeAddress && !environmentApplied) {
      log(
        `Pointing AgentCore runtime ${runtimeId} at ${context.publicAddress}`,
      );

      // update-agent-runtime replaces the runtime rather than patching it, so
      // the role, artifact, and network configuration have to be sent back
      // unchanged alongside the new environment. Reading them first keeps the
      // scenario from having to know how the runtime was built.
      const current =
        await $`aws bedrock-agentcore-control get-agent-runtime --region ${options.region} --agent-runtime-id ${runtimeId} --output json`
          .quiet()
          .nothrow();

      if (current.exitCode !== 0) {
        throw failure({
          attempting: `Could not read AgentCore runtime ${runtimeId}, so its role and artifact could not be carried into the update.`,
          reported: current.stderr || current.stdout,
          fixes: [
            'AccessDenied means the caller lacks bedrock-agentcore:GetAgentRuntime.',
            `ResourceNotFound means no runtime with that id exists in ${options.region}; the region must match the one in the endpoint ARN.`,
          ],
          seeAlso: [
            `aws bedrock-agentcore-control list-agent-runtimes --region ${options.region}`,
            'aws sts get-caller-identity',
          ],
        });
      }

      const runtime = JSON.parse(current.stdout) as {
        roleArn?: string;
        agentRuntimeArtifact?: unknown;
        networkConfiguration?: unknown;
      };

      if (!runtime.roleArn || !runtime.agentRuntimeArtifact) {
        throw failure({
          attempting: `AgentCore runtime ${runtimeId} did not report the role and artifact needed to update it.`,
          reported: current.stdout,
          fixes: [
            'Update it by hand with --role-arn and --agent-runtime-artifact, then set updateRuntimeAddress: false.',
          ],
        });
      }

      const updated =
        await $`aws bedrock-agentcore-control update-agent-runtime --region ${options.region} --agent-runtime-id ${runtimeId} --role-arn ${runtime.roleArn} --agent-runtime-artifact ${JSON.stringify(
          runtime.agentRuntimeArtifact,
        )} --network-configuration ${JSON.stringify(
          runtime.networkConfiguration ?? { networkMode: 'PUBLIC' },
        )} --environment-variables ${JSON.stringify(
          workerEnvironment,
        )} --output json`
          .quiet()
          .nothrow();

      if (updated.exitCode !== 0 && /ConflictException/.test(updated.stderr)) {
        throw failure({
          attempting: `AgentCore runtime ${runtimeId} was busy and would not accept the tunnel address.`,
          reported: updated.stderr,
          fixes: [
            'The runtime is mid-create or mid-update. It settles in a minute or two; run the scenario again.',
          ],
          seeAlso: [
            `aws bedrock-agentcore-control get-agent-runtime --region ${options.region} --agent-runtime-id ${runtimeId} --query status`,
          ],
        });
      }

      if (updated.exitCode !== 0) {
        throw failure({
          attempting: `Could not point AgentCore runtime ${runtimeId} at this run's tunnel, so the Worker it starts would dial a stale address.`,
          reported: updated.stderr || updated.stdout,
          fixes: [
            'AccessDenied means the caller lacks bedrock-agentcore:UpdateAgentRuntime, or iam:PassRole on the execution role.',
            'ValidationException naming the container URI means the execution role cannot pull the image from ECR.',
            'Or set updateRuntimeAddress: false and keep TEMPORAL_ADDRESS current yourself.',
          ],
          seeAlso: [
            `aws bedrock-agentcore-control get-agent-runtime --region ${options.region} --agent-runtime-id ${runtimeId}`,
          ],
        });
      }

      await waitForEndpoint(
        options.region,
        runtimeId,
        endpointName,
        options.runtimeReadyTimeoutMs,
        log,
      );

      observations.push(
        `AgentCore runtime ${runtimeId} points at ${context.publicAddress}, this run's tunnel.`,
      );
    } else if (environmentApplied) {
      observations.push(
        `AgentCore runtime ${runtimeId} was created pointing at ${context.publicAddress}, this run's tunnel.`,
      );
    }

    const connection = await Connection.connect({ address: context.address });
    const client = new Client({ connection, namespace });

    log(`Creating Worker Deployment "${options.deploymentName}"`);

    // Lazily created deployments do not exist until a Worker polls, and a
    // serverless Version has no Worker yet, so it is created up front.
    await $`${cli} worker deployment create --address ${context.address} --namespace ${namespace} --name ${options.deploymentName}`
      .quiet()
      .nothrow();

    log(
      `Creating Version ${buildId} with the aws-agentcore provider — this invokes the Worker`,
    );

    // Creating the Version is what starts the Worker Controller Instance,
    // which invokes the runtime. That first invoke is also what bootstraps the
    // task queue association: the Worker polls with versioning, and matching
    // learns the queue from that registration. Nothing else can teach it,
    // because create-version takes no task queue.
    const created =
      await $`${cli} worker deployment create-version --address ${context.address} --namespace ${namespace} --deployment-name ${options.deploymentName} --build-id ${buildId} --aws-agentcore-endpoint-arn ${endpointArn} --aws-agentcore-skip-role-and-external-id`
        .quiet()
        .nothrow();

    if (created.exitCode !== 0) {
      throw failure({
        attempting: `The server rejected Version ${buildId} with the aws-agentcore compute provider.`,
        reported: created.stderr || created.stdout,
        fixes: [
          '"unknown compute provider" or "Could not instantiate compute provider" means the server does not have the provider registered: its auto-scaled-workers dependency predates it. requires.serverModules is what asserts that, so check the server stage actually built from a checkout carrying the bump.',
          '"workercontroller" errors mean the feature gate is off: set workercontroller.enabled in dynamicConfig.',
          'An AWS error here comes from ValidateConfig calling GetAgentRuntimeEndpoint, so it means the credentials the server runs with cannot reach the endpoint. The server needs AWS_REGION and working credentials in its own environment, not just yours.',
          'A validation error naming the ARN means it is not a Runtime Endpoint ARN; it must end in /runtime-endpoint/<name>.',
        ],
        seeAlso: [
          `aws bedrock-agentcore-control get-agent-runtime-endpoint --region ${options.region} --agent-runtime-id ${runtimeId} --endpoint-name ${endpointName}`,
          'The server log in the run directory records what the Worker Controller activity returned.',
        ],
      });
    }

    observations.push(
      `Version ${options.deploymentName}.${buildId} was accepted with provider "aws-agentcore" and scaler "no-sync".`,
    );

    log('Waiting for the AgentCore Worker to register its task queue');

    const deadline = Date.now() + options.runtimeReadyTimeoutMs;
    let registered = false;

    while (Date.now() < deadline && !registered) {
      const described =
        await $`${cli} worker deployment describe-version --address ${context.address} --namespace ${namespace} --deployment-name ${options.deploymentName} --build-id ${buildId} -o json`
          .quiet()
          .nothrow();

      if (described.exitCode === 0) {
        const info = JSON.parse(described.stdout) as {
          taskQueuesInfos?: { name?: string }[] | null;
        };

        registered = Boolean(
          info.taskQueuesInfos?.some(
            (queue) => queue.name === options.taskQueue,
          ),
        );
      }

      if (!registered) await sleep(5_000);
    }

    if (!registered) {
      throw failure({
        attempting: `The AgentCore Worker never registered task queue "${options.taskQueue}". The provider was invoked, so the container started but did not begin polling.`,
        fixes: [
          'A Worker built with UseVersioning must register every workflow through RegisterWorkflowWithOptions with a VersioningBehavior. Plain RegisterWorkflow panics with "workflow type does not have a versioning behavior" before the first poll.',
          `The container must dial ${context.publicAddress}. If it cannot, the tunnel is up but the runtime still holds a previous run's address; leave updateRuntimeAddress on.`,
          `Its TEMPORAL_TASK_QUEUE must be "${options.taskQueue}", matching this scenario's taskQueue option.`,
        ],
        seeAlso: [
          `aws logs tail /aws/bedrock-agentcore/runtimes/${runtimeId}-${endpointName} --region ${options.region} --since 10m`,
          `temporal worker deployment describe-version --address ${context.address} --namespace ${namespace} --deployment-name ${options.deploymentName} --build-id ${buildId} -o json`,
        ],
      });
    }

    observations.push(
      `The Worker inside AgentCore dialed back through the tunnel and registered "${options.taskQueue}".`,
    );

    log(`Setting ${buildId} current so tasks route to it`);

    await $`${cli} worker deployment set-current-version --address ${context.address} --namespace ${namespace} --deployment-name ${options.deploymentName} --build-id ${buildId} --yes`
      .quiet()
      .nothrow();

    const workflowId = `agentcore-demo-${buildId}`;

    log(`Running ${options.workflowType} on the AgentCore-hosted Worker`);

    const handle = await client.workflow.start(options.workflowType, {
      taskQueue: options.taskQueue,
      workflowId,
      args: [options.workflowInput],
      workflowExecutionTimeout: options.workflowTimeoutMs,
    });

    const result = await handle.result();

    observations.push(
      `${options.workflowType} completed on the AgentCore Worker and returned: ${JSON.stringify(result)}`,
    );

    if (teardown.length) {
      observations.push(
        [
          'This run provisioned AWS resources, and an AgentCore runtime bills while it exists.',
          'They are left in place so the demo can be inspected, and reused by later runs.',
          'Remove them with:',
          ...teardown.map((command) => `  ${command}`),
        ].join('\n'),
      );
    }

    return {
      workflows: [
        {
          role: 'runs on the AgentCore-hosted Worker',
          workflowId,
          runId: handle.firstExecutionRunId,
          note: 'Executed by a Worker that Temporal launched as a Bedrock AgentCore session, not by a Worker started here.',
        },
      ],
      observations,
      shutdown: async () => {
        await connection.close();
      },
    };
  },
};

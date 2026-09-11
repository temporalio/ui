import type { Options } from './scenario';
import { defineScenario } from '../../definition';

export const definition = defineScenario({
  name: 'agentcore-serverless-worker',
  title: 'A Worker that Temporal launches as a Bedrock AgentCore session',
  summary:
    'Runs the whole server-scaled Worker path against a real Bedrock AgentCore Runtime. The Worker Controller invokes the runtime, the Worker that starts there dials the frontend back through a tunnel, registers its task queue, and executes a workflow. Nothing polls from this machine: the only Worker is the one AWS started.',
  server: {
    // The provider reaches the server through a dependency bump rather than a
    // server commit, so no published release carries it.
    source: 'workspace',
    requires: {
      serverModules: {
        // The commit that registers the aws-agentcore provider.
        'go.temporal.io/auto-scaled-workers':
          'v0.0.0-20260824233950-312f95fb8b99',
      },
      commands: ['aws', 'temporal'],
    },
    // Distinct ports on purpose. The server stage stands down when something
    // already listens, which for this scenario would silently reuse a server
    // that has no aws-agentcore provider and make the run prove nothing.
    port: 7533,
    uiPort: 8533,
    httpPort: 7543,
    dynamicConfig: {
      // Without this the server rejects any compute config outright.
      'workercontroller.enabled': true,
      // Use the ambient AWS credentials rather than assuming a role, so a
      // local run needs no IAM role, trust policy, or external ID. Cloud
      // always requires them; this is a local-only shortcut.
      'workercontroller.compute_providers.aws.require_role_and_external_id': false,
    },
  },
  // The Worker is the one AgentCore starts. A catalog worker here would poll
  // the same queue and quietly make the demo prove nothing.
  worker: { enabled: false },
  // Load-bearing: the Version is created by driving this UI, so --skip ui
  // leaves the scenario with nothing to drive.
  tunnel: { enabled: true },
  scenario: {
    // Empty reads AGENTCORE_ENDPOINT_ARN. See "Provisioning the AgentCore
    // runtime" in utilities/demo/README.md.
    endpointArn: '',
    // On, because this scenario cannot run without a runtime and a demo whose
    // first run fails is not a demo. It creates one and reuses it on later
    // runs, so repeating this does not add a second.
    //
    // It does bill while it exists, so the run prints what it created and the
    // commands to remove it. Set endpointArn or AGENTCORE_ENDPOINT_ARN to
    // point at your own instead, or provision: false to refuse outright.
    provision: true,
    region: 'us-west-2',
    deploymentName: 'agentcore-demo',
    taskQueue: 'agentcore-tq',
    workflowType: 'Greet',
    workflowInput: 'demo',
  } satisfies Options,
  preview: {
    notes: [
      'The Version is created by driving the real create-version form with Playwright, not by the CLI. That is the point: the CLI could already do this, so a CLI run proves nothing about the change under review. Set createVersion: "cli" to fall back, and headed: true to watch the browser do it.',
      'The summary must report the workflow completed, and its result must name the AgentCore host. Nothing polled from this machine, so only a Worker AWS started could have run it.',
      'Open the Worker Deployment Version in the UI. Its compute provider must read AgentCore, with scaler "no-sync", and its task queues must list the queue the workflow ran on. That registration came from the Worker inside AgentCore polling with versioning.',
      'The Resource field on the version must be the Runtime *Endpoint* ARN, ending in /runtime-endpoint/<name>. A bare Runtime ARN is rejected: the provider parses the runtime id and endpoint name out of it.',
      'Check the runtime log group. It must show one INVOKED line carrying {"deploymentName","buildId"} — the payload the Worker Controller sends — followed by the Worker reporting that it is polling.',
      'Run it twice. The second run gets a fresh tunnel hostname and a fresh build id, and must still work: the scenario repoints the runtime each time rather than trusting a stored address.',
      "The form makes IAM Role ARN and External ID required and always sends them, and require_role_and_external_id false makes the role optional rather than ignored: the server assumes what it is sent. The run provisions a real invoke role, and the Version works only because that role assumes. The UI has no equivalent of the CLI's --aws-agentcore-skip-role-and-external-id, which is a real gap, tracked separately.",
    ],
  },
});

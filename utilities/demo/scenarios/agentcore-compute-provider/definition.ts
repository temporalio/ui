import { defineScenario } from '../../definition';

export const definition = defineScenario({
  name: 'agentcore-compute-provider',
  title: 'Amazon Bedrock AgentCore as a serverless Worker compute provider',
  summary:
    'Brings up the UI against a dev server so a reviewer can walk the serverless Worker forms with AgentCore in the picker. On a stock server the option is gated behind the serverScaledProviderAgentCore capability and renders Coming Soon, which is the behaviour this PR ships: the same sequence Cloud Run followed, where the UI landed before temporalio/api#799 added its capability field. The enabled form is covered by Storybook, which needs no server at all.',
  server: {
    // `auto` downloads a published CLI release. Nothing here needs an
    // unreleased server: the gated state is what a stock server produces, and
    // it is the state this PR ships until the capability exists. See the notes
    // below for what the enabled path additionally requires.
    source: 'auto',
  },
  // No workflows to run. The review is over the deployment create/edit forms,
  // not over workflow history, so the catalog worker would only add noise.
  worker: { enabled: false },
  examples: [],
  preview: {
    notes: [
      'Storybook covers the enabled form with no server: run `pnpm storybook` and open Workers/Compute Provider Picker. "AWS namespace (Lambda and AgentCore)" must show both AWS cards, Lambda badged Public Preview and AgentCore badged Pre-release.',
      'In the running UI, open a namespace and start a serverless Worker deployment. The Compute Provider list must show Amazon Bedrock AgentCore, disabled, badged Coming Soon, because this server does not advertise serverScaledProviderAgentCore.',
      'Lambda must be unchanged: selectable, with its Function ARN field, IAM Role ARN, External ID, and the CloudFormation/Terraform role helper.',
      'Select AgentCore in Storybook\'s "AWS namespace (Lambda and AgentCore)" story. The Resource field must read "Agent Runtime Endpoint ARN" — not "Agent Runtime ARN" — because the provider parses the runtime id and endpoint name out of it and rejects a bare Runtime ARN.',
      'AgentCore must reuse the Lambda Access fields (IAM Role ARN, External ID) and must NOT offer the CloudFormation/Terraform helper, which grants lambda:InvokeFunction and would hand out a role that cannot invoke a runtime.',
      'Open Scaling and Lifecycle under AgentCore. It must show the invoke-based fields (scale-up cooloff, backlog threshold, max worker lifetime, metrics poll interval) and no replica or utilization controls, because AgentCore pairs with the no-sync scaler like Lambda.',
      'Saving an AgentCore version end to end additionally needs a server whose auto-scaled-workers dependency contains 312f95fb8b99a2fecdcbe3d1763c2c655e921f4a (2026-08-24), which registers the aws-agentcore provider. temporalio/temporal main still pins v0.0.0-20260811170210, so a stock server rejects the provider type. Build one with TEMPORAL_SERVER_REPO pointed at a checkout carrying the bump.',
      'Enabling the option rather than gating it needs server_scaled_provider_agent_core in temporalio/api plus the server advertising it in GetSystemInfo. Neither exists yet; cloud-ui can enable it sooner by mapping an account feature flag into its synthesized capabilities, as it does for Cloud Run.',
    ],
  },
});

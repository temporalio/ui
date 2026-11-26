# Terraform AWS IAM Role Module for Serverless Workers on Bedrock AgentCore.
# Creates the IAM role Temporal assumes to invoke your AgentCore Runtimes.
#
# This is not the AgentCore execution role, which AgentCore assumes to pull
# your image. This role is assumed by Temporal to start a session.
module "serverless-worker-agentcore" {
  source = "terraform-modules/modules/serverless-workers/aws/agentcore"

  external_id = "<external-id>"

  # IAM principals allowed to assume this role to invoke your workers.
  # Temporal Cloud provides these values; for self-hosted deployments,
  # use the IAM identity your Temporal service runs as.
  temporal_cloud_principals = [
    "<principal-arn>",
  ]

  # Runtime Endpoint ARNs, the same four-part value the Version takes.
  agent_runtime_arns = [
    "arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-worker-abc123/runtime-endpoint/DEFAULT",
  ]

  # Optional: override the default role name
  # role_name = "Temporal-Cloud-Serverless-Worker-AgentCore"
}

# Once applied, provide the role_arn output value to Temporal.

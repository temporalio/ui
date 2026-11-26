# Terraform AWS IAM Role Module for Serverless Workers.
# Creates the IAM role Temporal Cloud assumes to invoke your Lambda functions.
module "serverless-worker-lambda" {
  source = "terraform-modules/modules/serverless-workers/aws/lambda"

  external_id = "<external-id>"

  # IAM principals allowed to assume this role to invoke your workers.
  # Temporal Cloud provides these values; for self-hosted deployments,
  # use the IAM identity your Temporal service runs as.
  temporal_cloud_principals = [
    "<principal-arn>",
  ]

  lambda_function_arns = [
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-1",
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-2",
  ]

  # Optional: override the default role name
  # role_name = "Temporal-Cloud-Serverless-Worker"
}

# Once applied, provide the role_arn output value to Temporal Cloud.

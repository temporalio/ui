# Terraform AWS IAM Role Module for Serverless Workers.
# Creates the IAM role Temporal Cloud assumes to invoke your Lambda functions.
module "serverless-worker-lambda" {
  source = "terraform-modules/modules/serverless-workers/aws/lambda"

  external_id               = "<external-id>"
  temporal_cloud_principals = "<provided by Temporal Cloud>"

  lambda_function_arns = [
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-1",
    "arn:aws:lambda:us-east-1:123456789012:function:my-worker-2",
  ]

  # Optional: override the default role name
  # role_name = "Temporal-Cloud-Serverless-Worker"
}

# Once applied, provide the role_arn output value to Temporal Cloud.

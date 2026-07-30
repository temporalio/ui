# Terraform GCP Service Account Module for Cloud Run Serverless Workers.
module "serverless-worker-cloud-run" {
  source = "github.com/temporalio/terraform-modules//modules/serverless-workers/gcp/cloud-run"

  project_id         = "__TEMPORAL_GCP_PROJECT_ID__"
  invoker_account_id = "temporal-worker-pool-invoker"

  # REPLACE BEFORE APPLY with the email of the service account permitted to impersonate the invoker.
  impersonator_service_account_emails = [
    "<REPLACE-WITH-IMPERSONATOR-SERVICE-ACCOUNT-EMAIL>",
  ]
}

# Once applied, use the invoker_email output value as the Service Account for the Worker deployment.

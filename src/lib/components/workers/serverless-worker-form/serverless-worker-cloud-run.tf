# Terraform GCP Service Account Module for Cloud Run Serverless Workers.
module "serverless-worker-cloud-run" {
  source = "github.com/temporalio/terraform-modules//modules/serverless-workers/gcp/cloud-run"

  project_id         = "__TEMPORAL_GCP_PROJECT_ID__"
  invoker_account_id = "temporal-worker-pool-invoker"

  # REPLACE BEFORE APPLY with the service account email provided by Temporal Cloud.
  impersonator_service_account_emails = [
    "<REPLACE-WITH-TEMPORAL-CLOUD-SERVICE-ACCOUNT-EMAIL>",
  ]
}

# Once applied, provide the invoker_email output value to Temporal Cloud.

const CLOUD_RUN_PROJECT_TOKEN = '"__TEMPORAL_GCP_PROJECT_ID__"';
const CLOUD_RUN_PROJECT_PLACEHOLDER = '<YOUR-GCP-PROJECT-ID>';

export function interpolateCloudRunTerraformTemplate(
  template: string,
  projectId: string,
): string {
  return template.replace(
    CLOUD_RUN_PROJECT_TOKEN,
    JSON.stringify(projectId || CLOUD_RUN_PROJECT_PLACEHOLDER),
  );
}

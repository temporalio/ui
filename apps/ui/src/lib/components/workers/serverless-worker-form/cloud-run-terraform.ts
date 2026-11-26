const CLOUD_RUN_PROJECT_TOKEN = '"__TEMPORAL_GCP_PROJECT_ID__"';
const CLOUD_RUN_PROJECT_PLACEHOLDER = '<YOUR-GCP-PROJECT-ID>';
const CLOUD_RUN_IMPERSONATOR_PLACEHOLDER =
  '<REPLACE-WITH-IMPERSONATOR-SERVICE-ACCOUNT-EMAIL>';

const escapeTerraformTemplateSequences = (value: string): string =>
  value.replaceAll('${', () => '$${').replaceAll('%{', () => '%%{');

export function interpolateCloudRunTerraformTemplate(
  template: string,
  projectId: string,
): string {
  const resolvedProjectId = escapeTerraformTemplateSequences(
    projectId || CLOUD_RUN_PROJECT_PLACEHOLDER,
  );

  return template.replaceAll(CLOUD_RUN_PROJECT_TOKEN, () =>
    JSON.stringify(resolvedProjectId),
  );
}

export function hasCloudRunImpersonatorPlaceholder(template: string): boolean {
  return template.includes(CLOUD_RUN_IMPERSONATOR_PLACEHOLDER);
}

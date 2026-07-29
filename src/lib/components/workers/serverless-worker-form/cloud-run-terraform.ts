const CLOUD_RUN_PROJECT_TOKEN = '"__TEMPORAL_GCP_PROJECT_ID__"';
const CLOUD_RUN_PROJECT_PLACEHOLDER = '<YOUR-GCP-PROJECT-ID>';
const CLOUD_RUN_RUNNER_SERVICE_ACCOUNT_TOKEN =
  '"__TEMPORAL_GCP_RUNNER_SERVICE_ACCOUNT_EMAIL__"';
const CLOUD_RUN_IMPERSONATOR_PLACEHOLDER =
  '<REPLACE-WITH-IMPERSONATOR-SERVICE-ACCOUNT-EMAIL>';

const escapeTerraformTemplateSequences = (value: string): string =>
  value.replaceAll('${', () => '$${').replaceAll('%{', () => '%%{');

export function interpolateCloudRunTerraformTemplate(
  template: string,
  projectId: string,
  runnerServiceAccountEmail = '',
): string {
  const resolvedProjectId = escapeTerraformTemplateSequences(
    projectId || CLOUD_RUN_PROJECT_PLACEHOLDER,
  );
  const resolvedRunnerServiceAccountEmail = escapeTerraformTemplateSequences(
    runnerServiceAccountEmail,
  );

  return template
    .replaceAll(CLOUD_RUN_PROJECT_TOKEN, () =>
      JSON.stringify(resolvedProjectId),
    )
    .replaceAll(CLOUD_RUN_RUNNER_SERVICE_ACCOUNT_TOKEN, () =>
      JSON.stringify(resolvedRunnerServiceAccountEmail),
    );
}

export function hasCloudRunImpersonatorPlaceholder(template: string): boolean {
  return template.includes(CLOUD_RUN_IMPERSONATOR_PLACEHOLDER);
}

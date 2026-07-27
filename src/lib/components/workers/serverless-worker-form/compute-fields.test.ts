import { describe, expect, it } from 'vitest';

import { interpolateCloudRunTerraformTemplate } from './cloud-run-terraform';

const template = 'project_id = "__TEMPORAL_GCP_PROJECT_ID__"';

describe('interpolateCloudRunTerraformTemplate', () => {
  it('inserts the current GCP project ID as a Terraform string value', () => {
    expect(interpolateCloudRunTerraformTemplate(template, 'my-project')).toBe(
      'project_id = "my-project"',
    );
  });

  it('uses the setup placeholder when no GCP project ID is available', () => {
    expect(interpolateCloudRunTerraformTemplate(template, '')).toBe(
      'project_id = "<YOUR-GCP-PROJECT-ID>"',
    );
  });

  it('escapes project IDs safely for Terraform', () => {
    expect(interpolateCloudRunTerraformTemplate(template, 'project"name')).toBe(
      'project_id = "project\\"name"',
    );
  });
});

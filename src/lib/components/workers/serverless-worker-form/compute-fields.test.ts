import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  hasCloudRunImpersonatorPlaceholder,
  interpolateCloudRunTerraformTemplate,
} from './cloud-run-terraform';

import ComputeFields from './compute-fields.svelte';

vi.stubGlobal(
  'ResizeObserver',
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

const projectToken = '"__TEMPORAL_GCP_PROJECT_ID__"';
const impersonatorPlaceholder =
  '<REPLACE-WITH-IMPERSONATOR-SERVICE-ACCOUNT-EMAIL>';
const impersonatorWarning =
  'Before applying, replace the impersonator service account placeholder with the email of the service account permitted to impersonate the invoker.';
const cloudRunModuleUrl =
  'https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers/gcp/cloud-run';
const mountedComponents: Record<string, unknown>[] = [];

const expectedTerraform = (
  projectId: string,
) => `# Terraform GCP Service Account Module for Cloud Run Serverless Workers.
module "serverless-worker-cloud-run" {
  source = "github.com/temporalio/terraform-modules//modules/serverless-workers/gcp/cloud-run"

  project_id         = "${projectId}"
  invoker_account_id = "temporal-worker-pool-invoker"

  # REPLACE BEFORE APPLY with the email of the service account permitted to impersonate the invoker.
  impersonator_service_account_emails = [
    "${impersonatorPlaceholder}",
  ]
}

# Once applied, use the invoker_email output value as the Service Account for the Worker deployment.
`;

interface ComputeFieldsOptions {
  provider: string;
  gcpProject?: string;
  cloudRunTerraformTemplate?: string;
  terraformTemplate?: string;
}

const renderComputeFields = ({
  provider,
  gcpProject = '',
  cloudRunTerraformTemplate,
  terraformTemplate,
}: ComputeFieldsOptions) => {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(ComputeFields, {
    target,
    props: {
      provider,
      lambdaArn: '',
      iamRoleArn: '',
      roleExternalId: '',
      gcpProject,
      cloudRunTerraformTemplate,
      terraformTemplate,
    },
  });
  mountedComponents.push(component);
  return target;
};

const openAccordion = async (target: HTMLElement) => {
  const accordion = target.querySelector<HTMLButtonElement>(
    '[data-track-name="accordion"]',
  );
  expect(accordion).not.toBeNull();
  accordion?.click();
  await tick();
  return accordion;
};

const getCopyButton = (target: HTMLElement) => {
  const button = target.querySelector<HTMLButtonElement>(
    '[data-track-name="copyable-button"]',
  );
  expect(button).not.toBeNull();
  return button as HTMLButtonElement;
};

const stubClipboard = () => {
  const writeText = vi.fn<(content: string) => Promise<void>>();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return writeText;
};

afterEach(async () => {
  await Promise.all(
    mountedComponents.splice(0).map((component) => unmount(component)),
  );
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Cloud Run Terraform helpers', () => {
  it('interpolates every project token and uses the setup placeholder when empty', () => {
    const template = `first = ${projectToken}\nsecond = ${projectToken}`;

    expect(interpolateCloudRunTerraformTemplate(template, 'my-project')).toBe(
      'first = "my-project"\nsecond = "my-project"',
    );
    expect(interpolateCloudRunTerraformTemplate(projectToken, '')).toBe(
      '"<YOUR-GCP-PROJECT-ID>"',
    );
  });

  it('escapes the project as an HCL string without enabling template interpolation', () => {
    expect(
      interpolateCloudRunTerraformTemplate(
        `project_id = ${projectToken}`,
        'project"\\name-${region}-%{if true}',
      ),
    ).toBe('project_id = "project\\"\\\\name-$${region}-%%{if true}"');
  });

  it('preserves JavaScript replacement-pattern characters in the project value', () => {
    expect(interpolateCloudRunTerraformTemplate(projectToken, "$&-$`-$'")).toBe(
      '"$&-$`-$\'"',
    );
  });

  it('detects only the bundled impersonator placeholder in resolved content', () => {
    expect(
      hasCloudRunImpersonatorPlaceholder(
        `impersonator_service_account_emails = ["${impersonatorPlaceholder}"]`,
      ),
    ).toBe(true);
    expect(
      hasCloudRunImpersonatorPlaceholder(
        '<REPLACE-WITH-TEMPORAL-CLOUD-SERVICE-ACCOUNT-EMAIL>',
      ),
    ).toBe(false);
    expect(hasCloudRunImpersonatorPlaceholder('host@example.com')).toBe(false);
  });
});

describe('ComputeFields Cloud Run setup guidance', () => {
  it('renders the guidance link and an accessible Terraform snippet label', async () => {
    const target = renderComputeFields({
      provider: 'cloud-run',
      gcpProject: 'initial-project',
    });
    await tick();

    const accordion = await openAccordion(target);
    expect(accordion?.textContent).toContain(
      "Don't have a service account yet? Create one",
    );
    expect(accordion?.getAttribute('aria-expanded')).toBe('true');

    const moduleLink = target.querySelector<HTMLAnchorElement>(
      `a[href="${cloudRunModuleUrl}"]`,
    );
    expect(moduleLink?.textContent.trim()).toBe('Google Cloud Run Module');
    expect(moduleLink?.target).toBe('_blank');
    expect(target.textContent).toContain(impersonatorWarning);
    expect(target.textContent).toContain(
      "copy the module's invoker_email output into the Service Account field above",
    );
    expect(
      target.querySelector(
        '.cm-content[aria-label="Google Cloud Run Module"][aria-readonly="true"]',
      ),
    ).not.toBeNull();
  });

  it('uses the bundled template and updates its project reactively', async () => {
    const writeText = stubClipboard();
    const target = renderComputeFields({
      provider: 'cloud-run',
      gcpProject: 'initial-project',
    });
    await tick();
    await openAccordion(target);

    getCopyButton(target).click();
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expectedTerraform('initial-project'),
      );
    });

    const projectInput = target.querySelector<HTMLInputElement>('#gcpProject');
    expect(projectInput).not.toBeNull();
    if (!projectInput) return;

    projectInput.value = 'updated-project';
    projectInput.dispatchEvent(new Event('input', { bubbles: true }));
    await tick();
    writeText.mockClear();

    getCopyButton(target).click();
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expectedTerraform('updated-project'),
      );
    });
  });

  it('uses a host template and shows the warning only when its content has the placeholder', async () => {
    const writeText = stubClipboard();
    const target = renderComputeFields({
      provider: 'cloud-run',
      gcpProject: 'host-project',
      cloudRunTerraformTemplate: `project_id = ${projectToken}\nprincipal = "${impersonatorPlaceholder}"`,
    });
    await tick();
    await openAccordion(target);

    expect(target.textContent).toContain(impersonatorWarning);
    getCopyButton(target).click();
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `project_id = "host-project"\nprincipal = "${impersonatorPlaceholder}"`,
      );
    });
  });

  it('omits the warning for a host template without the placeholder', async () => {
    const target = renderComputeFields({
      provider: 'cloud-run',
      cloudRunTerraformTemplate: 'principal = "host-provided@example.com"',
    });
    await tick();
    await openAccordion(target);

    expect(target.textContent).not.toContain(impersonatorWarning);
  });

  it('treats an explicit empty host template as an override', async () => {
    const target = renderComputeFields({
      provider: 'cloud-run',
      cloudRunTerraformTemplate: '',
    });
    await tick();
    await openAccordion(target);

    expect(target.textContent).not.toContain(impersonatorWarning);
  });

  it('isolates Cloud Run guidance from Lambda and preserves the AWS override', async () => {
    const writeText = stubClipboard();
    const target = renderComputeFields({
      provider: 'lambda',
      cloudRunTerraformTemplate: `principal = "${impersonatorPlaceholder}"`,
      terraformTemplate: 'aws-template-from-host',
    });
    await tick();

    expect(target.textContent).toContain("Don't have a role yet? Create one");
    expect(target.textContent).not.toContain(
      "Don't have a service account yet? Create one",
    );
    expect(target.querySelector(`a[href="${cloudRunModuleUrl}"]`)).toBeNull();
    expect(target.textContent).not.toContain(impersonatorWarning);

    await openAccordion(target);
    const terraformTab = Array.from(
      target.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.trim() === 'Terraform');
    expect(terraformTab).not.toBeUndefined();
    terraformTab?.click();
    await tick();

    getCopyButton(target).click();
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('aws-template-from-host');
    });
  });
});

import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ComputeFields from './compute-fields.svelte';

vi.stubGlobal(
  'ResizeObserver',
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

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

  # REPLACE BEFORE APPLY with the service account email provided by Temporal Cloud.
  impersonator_service_account_emails = [
    "<REPLACE-WITH-TEMPORAL-CLOUD-SERVICE-ACCOUNT-EMAIL>",
  ]
}

# Once applied, provide the invoker_email output value to Temporal Cloud.
`;

const renderComputeFields = (provider: string, gcpProject = '') => {
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
    },
  });
  mountedComponents.push(component);
  return target;
};

const getCopyButton = (target: HTMLElement) => {
  const button = target.querySelector<HTMLButtonElement>(
    '[data-track-name="copyable-button"]',
  );
  expect(button).not.toBeNull();
  return button as HTMLButtonElement;
};

afterEach(async () => {
  await Promise.all(
    mountedComponents.splice(0).map((component) => unmount(component)),
  );
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('ComputeFields Cloud Run setup guidance', () => {
  it('renders expandable setup guidance with the Cloud Run module link', async () => {
    const target = renderComputeFields('cloud-run', 'initial-project');
    await tick();

    const accordion = target.querySelector<HTMLButtonElement>(
      '[data-track-name="accordion"]',
    );
    expect(accordion?.textContent).toContain(
      "Don't have a service account yet? Create one",
    );
    expect(accordion?.getAttribute('aria-expanded')).toBe('false');

    accordion?.click();
    await tick();

    expect(accordion?.getAttribute('aria-expanded')).toBe('true');
    const moduleLink = target.querySelector<HTMLAnchorElement>(
      `a[href="${cloudRunModuleUrl}"]`,
    );
    expect(moduleLink?.textContent.trim()).toBe('Google Cloud Run Module');
    expect(moduleLink?.target).toBe('_blank');
    expect(target.textContent).toContain(
      'Before applying, replace the impersonator service account placeholder',
    );
    expect(target.textContent).toContain(
      "copy the module's invoker_email output into the Service Account field above",
    );
  });

  it('copies the current project and updates the snippet reactively', async () => {
    const writeText = vi.fn<(content: string) => Promise<void>>();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const target = renderComputeFields('cloud-run', 'initial-project');
    await tick();

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

  it('does not render Cloud Run guidance for Lambda', async () => {
    const target = renderComputeFields('lambda');
    await tick();

    expect(target.textContent).toContain("Don't have a role yet? Create one");
    expect(target.textContent).not.toContain(
      "Don't have a service account yet? Create one",
    );
    expect(target.querySelector(`a[href="${cloudRunModuleUrl}"]`)).toBeNull();
  });
});

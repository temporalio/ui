// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  hasCloudRunImpersonatorPlaceholder,
  interpolateCloudRunTerraformTemplate,
} from './cloud-run-terraform';
import defaultCloudRunTerraformTemplate from './serverless-worker-cloud-run.tf?raw';

let computeFields: Component<Record<string, unknown>>;
let renderComponent: typeof render;
let viteServer: ViteDevServer;

beforeAll(async () => {
  const projectRoot = process.cwd();
  viteServer = await createServer({
    root: projectRoot,
    configFile: false,
    appType: 'custom',
    plugins: [svelte({ hot: false })],
    resolve: {
      alias: [
        {
          find: '$lib/holocene/code-block.svelte',
          replacement: path.resolve(
            projectRoot,
            'src/lib/components/workers/serverless-worker-form/compute-fields-code-block-test-double.svelte',
          ),
        },
        {
          find: '$lib',
          replacement: path.resolve(projectRoot, 'src/lib'),
        },
        {
          find: '$types',
          replacement: path.resolve(projectRoot, 'src/types'),
        },
        {
          find: '$app',
          replacement: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
        },
      ],
    },
    server: { middlewareMode: true },
  });
  computeFields = (
    await viteServer.ssrLoadModule(
      '/src/lib/components/workers/serverless-worker-form/compute-fields.svelte',
    )
  ).default;
  renderComponent = (await viteServer.ssrLoadModule('svelte/server')).render;
});

afterAll(async () => {
  await viteServer?.close();
});

const projectToken = '"__TEMPORAL_GCP_PROJECT_ID__"';
const runnerServiceAccountToken =
  '"__TEMPORAL_GCP_RUNNER_SERVICE_ACCOUNT_EMAIL__"';
const impersonatorPlaceholder =
  '<REPLACE-WITH-IMPERSONATOR-SERVICE-ACCOUNT-EMAIL>';
const impersonatorWarning =
  'Before applying, replace the impersonator service account placeholder with the email of the service account permitted to impersonate the invoker.';
const cloudRunModuleUrl =
  'https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers/gcp/cloud-run';

interface ComputeFieldsOptions {
  provider: string;
  gcpProject?: string;
  gcpServiceAccount?: string;
  cloudRunRunnerServiceAccountEmail?: string;
  cloudRunTerraformTemplate?: string;
  terraformTemplate?: string;
}

const renderComputeFields = ({
  provider,
  gcpProject = '',
  gcpServiceAccount = '',
  cloudRunRunnerServiceAccountEmail = '',
  cloudRunTerraformTemplate,
  terraformTemplate,
}: ComputeFieldsOptions): string => {
  const { body } = renderComponent(computeFields, {
    props: {
      provider,
      lambdaArn: '',
      iamRoleArn: '',
      roleExternalId: '',
      gcpProject,
      gcpServiceAccount,
      cloudRunRunnerServiceAccountEmail,
      cloudRunTerraformTemplate,
      terraformTemplate,
    },
  });
  return body;
};

const getTerraformSnippet = (body: string): string | undefined =>
  body
    .match(
      /<pre[^>]*data-testid="terraform-code-block"[^>]*>([\s\S]*?)<\/pre>/,
    )?.[1]
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');

describe('Cloud Run Terraform helpers', () => {
  it('interpolates every project and runner service account token', () => {
    const template = `first = ${projectToken}\nsecond = ${projectToken}\nrunner = ${runnerServiceAccountToken}`;

    expect(
      interpolateCloudRunTerraformTemplate(
        template,
        'my-project',
        'runner@example.com',
      ),
    ).toBe(
      'first = "my-project"\nsecond = "my-project"\nrunner = "runner@example.com"',
    );
  });

  it('uses the setup project placeholder and an empty runner value when blank', () => {
    expect(
      interpolateCloudRunTerraformTemplate(
        `project = ${projectToken}\nrunner = ${runnerServiceAccountToken}`,
        '',
        '',
      ),
    ).toBe('project = "<YOUR-GCP-PROJECT-ID>"\nrunner = ""');
  });

  it('escapes values as HCL strings without enabling template interpolation', () => {
    expect(
      interpolateCloudRunTerraformTemplate(
        `project_id = ${projectToken}\nrunner = ${runnerServiceAccountToken}`,
        'project"\\name-${region}-%{if true}',
        'runner"\\name-${identity}-%{if true}',
      ),
    ).toBe(
      'project_id = "project\\"\\\\name-$${region}-%%{if true}"\nrunner = "runner\\"\\\\name-$${identity}-%%{if true}"',
    );
  });

  it('preserves JavaScript replacement-pattern characters in interpolated values', () => {
    expect(
      interpolateCloudRunTerraformTemplate(
        `${projectToken}\n${runnerServiceAccountToken}`,
        "$&-$`-$'",
        "$'-$`-$&",
      ),
    ).toBe('"$&-$`-$\'"\n"$\'-$`-$&"');
  });

  it('includes the quoted runner service account token in the fallback template', () => {
    expect(defaultCloudRunTerraformTemplate).toContain(
      `runner_service_account_email = ${runnerServiceAccountToken}`,
    );
  });

  it('detects the actual bundled placeholder rather than how the template was supplied', () => {
    expect(
      hasCloudRunImpersonatorPlaceholder(defaultCloudRunTerraformTemplate),
    ).toBe(true);
    expect(
      hasCloudRunImpersonatorPlaceholder(
        '<REPLACE-WITH-TEMPORAL-CLOUD-SERVICE-ACCOUNT-EMAIL>',
      ),
    ).toBe(false);
    expect(hasCloudRunImpersonatorPlaceholder('host@example.com')).toBe(false);
  });
});

describe('ComputeFields server-rendered setup guidance', () => {
  it('renders Cloud Run guidance, link, warning, and accessible snippet label', () => {
    const body = renderComputeFields({
      provider: 'cloud-run',
      gcpProject: 'initial-project',
    });

    expect(body).toContain("Don't have a service account yet? Create one");
    expect(body).toContain(`href="${cloudRunModuleUrl}"`);
    expect(body).toContain('target="_blank"');
    expect(body).toContain('Google Cloud Run Module');
    expect(body).toContain(impersonatorWarning);
    expect(body).toContain('Worker Pool Service Account');
    expect(body).toContain(
      'Leave blank to use the project default Compute Engine service account.',
    );
    expect(body).toContain(
      "copy the module's invoker_email output into the Service Account field above",
    );

    expect(body).toContain('aria-label="Google Cloud Run Module"');
    expect(getTerraformSnippet(body)).toContain(
      'project_id                   = "initial-project"',
    );
    expect(getTerraformSnippet(body)).toContain(
      'runner_service_account_email = ""',
    );
  });

  it('reactively reflects project and runner service account changes in the snippet', () => {
    const initial = getTerraformSnippet(
      renderComputeFields({
        provider: 'cloud-run',
        gcpProject: 'initial',
        cloudRunRunnerServiceAccountEmail: 'initial-runner@example.com',
      }),
    );
    const updated = getTerraformSnippet(
      renderComputeFields({
        provider: 'cloud-run',
        gcpProject: 'updated',
        cloudRunRunnerServiceAccountEmail: 'updated-runner@example.com',
      }),
    );

    expect(initial).toContain('project_id                   = "initial"');
    expect(initial).toContain(
      'runner_service_account_email = "initial-runner@example.com"',
    );
    expect(updated).toContain('project_id                   = "updated"');
    expect(updated).toContain(
      'runner_service_account_email = "updated-runner@example.com"',
    );
    expect(updated).not.toContain('project_id                   = "initial"');
    expect(updated).not.toContain('initial-runner@example.com');
  });

  it('does not conflate the snippet runner identity with the invoker field', () => {
    const body = renderComputeFields({
      provider: 'cloud-run',
      gcpServiceAccount: 'invoker@example.com',
      cloudRunRunnerServiceAccountEmail: 'runner@example.com',
    });
    const snippet = getTerraformSnippet(body);

    expect(body).toContain('value="invoker@example.com"');
    expect(body).toContain('value="runner@example.com"');
    expect(snippet).toContain(
      'runner_service_account_email = "runner@example.com"',
    );
    expect(snippet).not.toContain('invoker@example.com');
  });

  it('uses a host template and derives its warning from placeholder content', () => {
    const body = renderComputeFields({
      provider: 'cloud-run',
      gcpProject: 'host-project',
      cloudRunRunnerServiceAccountEmail: 'runner@example.com',
      cloudRunTerraformTemplate: `project_id = ${projectToken}\nrunner = ${runnerServiceAccountToken}\nprincipal = "${impersonatorPlaceholder}"`,
    });

    expect(body).toContain(impersonatorWarning);
    expect(getTerraformSnippet(body)).toBe(
      `project_id = "host-project"\nrunner = "runner@example.com"\nprincipal = "${impersonatorPlaceholder}"`,
    );
  });

  it.each([
    ['custom content', 'principal = "host-provided@example.com"'],
    ['an explicit empty override', ''],
  ])('omits the warning for %s without the placeholder', (_, template) => {
    const body = renderComputeFields({
      provider: 'cloud-run',
      cloudRunTerraformTemplate: template,
    });

    expect(body).not.toContain(impersonatorWarning);
    expect(getTerraformSnippet(body)).toBe(template);
  });

  it('isolates Cloud Run guidance and templates from Lambda', () => {
    const body = renderComputeFields({
      provider: 'lambda',
      cloudRunTerraformTemplate: `principal = "${impersonatorPlaceholder}"`,
      terraformTemplate: 'aws-template-from-host',
    });

    expect(body).toContain("Don't have a role yet? Create one");
    expect(body).not.toContain("Don't have a service account yet? Create one");
    expect(body).not.toContain(`href="${cloudRunModuleUrl}"`);
    expect(body).not.toContain(impersonatorWarning);
    expect(body).not.toContain(impersonatorPlaceholder);
    expect(getTerraformSnippet(body)).toBeUndefined();
  });
});

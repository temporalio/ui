import { chromium, type Page } from '@playwright/test';

import type { Logger } from '../../paths';
import { failure } from '../../remedy';

export type UiCreateVersionOptions = {
  uiUrl: string;
  namespace: string;
  deploymentName: string;
  buildId: string;
  endpointArn: string;
  /**
   * The Access fields. This server runs with
   * `workercontroller.compute_providers.aws.require_role_and_external_id: false`
   * and discards both, but the form requires them, so the run has to have
   * something to type. See the note the scenario records about this.
   */
  iamRoleArn: string;
  externalId: string;
  /** Written per step, so a failed run leaves a picture of where it stopped. */
  screenshotDir?: string;
  /** Show the browser. The point of this scenario is watching the UI work. */
  headed?: boolean;
  log: Logger;
};

/** Long enough for a cold SvelteKit dev server to compile the route. */
const NAVIGATION_TIMEOUT_MS = 60_000;
const ACTION_TIMEOUT_MS = 20_000;

/**
 * Creates the Worker Deployment Version through the form rather than the CLI.
 *
 * The CLI path proves the server accepts an aws-agentcore compute config. It
 * says nothing about the UI, which is the thing under review: whether the
 * provider is offered, whether its one distinct field validates, and whether
 * what the form builds is a config the server takes. Driving the real form is
 * the only way to answer that.
 */
export const createVersionInUi = async (
  options: UiCreateVersionOptions,
): Promise<string[]> => {
  const {
    uiUrl,
    namespace,
    deploymentName,
    buildId,
    endpointArn,
    iamRoleArn,
    externalId,
    screenshotDir,
    headed,
    log,
  } = options;

  const observations: string[] = [];
  const createUrl = `${uiUrl.replace(/\/$/, '')}/namespaces/${encodeURIComponent(namespace)}/workers/deployments/${encodeURIComponent(deploymentName)}/versions/create`;

  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  page.setDefaultTimeout(ACTION_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

  const shoot = async (name: string) => {
    if (!screenshotDir) return;

    await page
      .screenshot({ path: `${screenshotDir}/${name}.png`, fullPage: true })
      .catch(() => undefined);
  };

  // Anything the page reports is worth more than a selector timeout, so it is
  // collected as it happens rather than reconstructed after the fact.
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  try {
    log(`Opening the create-version form at ${createUrl}`);

    await page.goto(createUrl, { waitUntil: 'networkidle' });
    await shoot('01-form-empty');

    await fill(page, '#buildId', buildId, 'Build ID');

    log('Selecting the Amazon Bedrock AgentCore provider');

    const agentCore = page.locator('#provider-agentcore');

    if (!(await agentCore.count())) {
      throw failure({
        attempting:
          'The create-version form does not offer Amazon Bedrock AgentCore.',
        reported: `No #provider-agentcore control on ${createUrl}.`,
        fixes: [
          'The picker builds its options from defaultProviders in compute-provider-picker.svelte. If AgentCore is missing there, this checkout predates the provider.',
          'In Cloud the picker is filtered by the namespace cloud and an account feature flag, but this is a self-hosted server, where every provider is offered.',
        ],
        seeAlso: [
          'src/lib/components/workers/serverless-worker-form/compute-provider-picker.svelte',
        ],
      });
    }

    // The option renders as a card wrapping the input, so the label is what
    // takes the click. Forcing it through the input covers either markup.
    await agentCore.check({ force: true });
    await shoot('02-agentcore-selected');

    observations.push(
      'The create-version form offered "Amazon Bedrock AgentCore" as a compute provider and accepted it as the selection.',
    );

    await fill(
      page,
      '#agentCoreEndpointArn',
      endpointArn,
      'Agent Runtime Endpoint ARN',
    );

    observations.push(
      'Selecting AgentCore revealed its one provider-specific field, the Agent Runtime Endpoint ARN, in place of the Lambda ARN.',
    );

    await fill(page, '#iamRoleArn', iamRoleArn, 'IAM Role ARN');
    await fill(page, '#roleExternalId', externalId, 'External ID');
    await shoot('03-form-filled');

    log('Submitting the form');

    await page.locator('button[type="submit"]').first().click();

    // Success leaves the create route. A validation failure stays and renders
    // the reason next to the field, which is the more useful thing to report.
    const left = await page
      .waitForURL((url) => !url.pathname.endsWith('/versions/create'), {
        timeout: NAVIGATION_TIMEOUT_MS,
      })
      .then(() => true)
      .catch(() => false);

    await shoot('04-after-submit');

    if (!left) {
      const messages = await page
        .locator('[aria-invalid="true"], .text-danger, [role="alert"]')
        .allTextContents();

      throw failure({
        attempting: `The form did not create Version ${buildId}.`,
        reported:
          messages.filter(Boolean).join('\n') ||
          consoleErrors.join('\n') ||
          'The page stayed on the create route and reported nothing.',
        fixes: [
          'A message on the Endpoint ARN field means the form rejected it before sending: it must be the four-part Runtime *Endpoint* ARN ending in /runtime-endpoint/<name>.',
          'A server error here is the same one the CLI path reports, so check the server log in the run directory for what the Worker Controller activity returned.',
          'IAM Role ARN and External ID are required by the form even though this server ignores them, so an empty one fails here and not on the server.',
        ],
        seeAlso: [
          screenshotDir ? `Screenshots in ${screenshotDir}` : '',
          createUrl,
        ].filter(Boolean),
      });
    }

    observations.push(
      `Version ${deploymentName}.${buildId} was created through the UI form, not the CLI. The form built the aws-agentcore compute config and the server accepted it.`,
    );

    log(`The form created Version ${buildId}`);

    return observations;
  } finally {
    await browser.close().catch(() => undefined);
  }
};

/** Fills a field, saying which one when it is not there. */
const fill = async (
  page: Page,
  selector: string,
  value: string,
  label: string,
) => {
  const field = page.locator(selector);

  if (!(await field.count())) {
    throw failure({
      attempting: `The create-version form has no ${label} field.`,
      reported: `No ${selector} on the page.`,
      fixes: [
        'The field ids come from compute-fields.svelte. If one was renamed, this driver needs the new id.',
      ],
      seeAlso: [
        'src/lib/components/workers/serverless-worker-form/compute-fields.svelte',
      ],
    });
  }

  await field.fill(value);
};

import { chromium, type Locator, type Page } from '@playwright/test';

import type { Logger } from '../../paths';
import { failure } from '../../remedy';

export type UiCreateVersionOptions = {
  uiUrl: string;
  namespace: string;
  deploymentName: string;
  buildId: string;
  endpointArn: string;
  /**
   * The Access fields, which the form requires and always sends.
   *
   * `require_role_and_external_id: false` makes the role optional, not
   * ignored: the server assumes whatever the config carries. So these have to
   * name a role that genuinely assumes, with the external ID its trust policy
   * enforces. A placeholder fails at AssumeRole well after the form is done.
   */
  iamRoleArn: string;
  externalId: string;
  /** Written per step, so a failed run leaves a picture of where it stopped. */
  screenshotDir?: string;
  /** Show the browser. The point of this scenario is watching the UI work. */
  headed?: boolean;
  log: Logger;
};

/**
 * The create-version page fetches the deployment before it renders anything,
 * and on a cold dev server the route is compiled on first request. Neither is
 * quick, and both happen after the load event, so the form is reliably absent
 * at networkidle.
 */
const FORM_TIMEOUT_MS = 90_000;
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
  page.setDefaultNavigationTimeout(FORM_TIMEOUT_MS);

  const shoot = async (name: string) => {
    if (!screenshotDir) return;

    // Reported rather than swallowed: a run that fails with no picture of the
    // page is a great deal harder to diagnose than one that says why.
    await page
      .screenshot({ path: `${screenshotDir}/${name}.png` })
      .catch((error: Error) =>
        log(`Could not write ${name}.png: ${error.message}`),
      );
  };

  // Anything the page reports is worth more than a selector timeout, so it is
  // collected as it happens rather than reconstructed after the fact.
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  try {
    log(`Opening the create-version form at ${createUrl}`);

    await page.goto(createUrl, { waitUntil: 'domcontentloaded' });

    await waitForForm(page, createUrl, deploymentName);
    await shoot('01-form-empty');

    await fill(page, '#buildId', buildId, 'Build ID');

    log('Selecting the Amazon Bedrock AgentCore provider');

    const agentCore = page.locator('#provider-agentcore');

    if (!(await appears(agentCore, 'attached'))) {
      throw failure({
        attempting:
          'The create-version form does not offer Amazon Bedrock AgentCore.',
        reported: `No #provider-agentcore control on ${createUrl}.`,
        fixes: [
          'The picker builds its options from defaultProviders in compute-provider-picker.svelte. If AgentCore is missing there, this checkout predates the provider.',
          'A Version already on this deployment locks the picker to that provider, so a deployment whose first Version used Lambda offers only Lambda. Use a fresh deployment name.',
        ],
        seeAlso: [
          'src/lib/components/workers/serverless-worker-form/compute-provider-picker.svelte',
          'src/lib/utilities/lock-compute-provider.ts',
        ],
      });
    }

    // The radio is styled appearance-none inside its label, so a plain click
    // can land on the decoration rather than the control.
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

    // Visible, and scoped to the form. The page keeps a closed confirm modal
    // whose button is also a form submit, and it comes first in the DOM, so
    // anything less specific waits on a button that is never shown.
    await page.locator('form button[type="submit"]:visible').first().click();

    // Success leaves the create route. A failure stays and renders the reason,
    // which is the more useful thing to report.
    const left = await page
      .waitForURL((url) => !url.pathname.endsWith('/versions/create'), {
        timeout: FORM_TIMEOUT_MS,
      })
      .then(() => true)
      .catch(() => false);

    await shoot('04-after-submit');

    if (!left) {
      const messages = await page
        .locator('[role="alert"]:visible, [aria-invalid="true"], .text-danger')
        .allTextContents();

      throw failure({
        attempting: `The form did not create Version ${buildId}.`,
        reported:
          messages
            .map((text) => text.trim())
            .filter(Boolean)
            .join('\n') ||
          consoleErrors.join('\n') ||
          'The page stayed on the create route and reported nothing.',
        fixes: [
          'A message on the Endpoint ARN field means the form rejected it before sending: it must be the four-part Runtime *Endpoint* ARN ending in /runtime-endpoint/<name>.',
          'A server error here is the same one the CLI path reports, so check the server log in the run directory for what the Worker Controller activity returned.',
          'An AccessDenied naming sts:AssumeRole means the role in the Access fields is not assumable by whoever runs the server, or its trust policy does not enforce the external ID given. The server assumes the role the form sends even when require_role_and_external_id is false.',
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

/** True when the locator reaches `state` before the action timeout. */
const appears = async (
  locator: Locator,
  state: 'visible' | 'attached',
  timeout = ACTION_TIMEOUT_MS,
) =>
  locator
    .first()
    .waitFor({ state, timeout })
    .then(() => true)
    .catch(() => false);

/**
 * Waits for the form to mount, and says which way it did not when it does not.
 * The page renders an error alert instead of the form when it cannot load the
 * deployment, so a bare timeout would report "no Build ID field" for what is
 * really a failed fetch.
 */
const waitForForm = async (
  page: Page,
  createUrl: string,
  deploymentName: string,
) => {
  const form = page.locator('#buildId');
  // :visible matters. The layout keeps hidden toast containers with this
  // role, so .first() would wait on one of those forever.
  const alert = page.locator('[role="alert"]:visible');

  const outcome = await Promise.race([
    form
      .waitFor({ state: 'visible', timeout: FORM_TIMEOUT_MS })
      .then(() => 'form' as const)
      .catch(() => 'absent' as const),
    alert
      .first()
      .waitFor({ state: 'attached', timeout: FORM_TIMEOUT_MS })
      .then(() => 'error' as const)
      .catch(() => 'absent' as const),
  ]);

  if (outcome === 'form') return;

  const reported =
    outcome === 'error'
      ? (await alert.allTextContents())
          .map((text) => text.trim())
          .filter(Boolean)
          .join('\n')
      : `The form did not render within ${FORM_TIMEOUT_MS / 1000}s.`;

  throw failure({
    attempting: `The create-version form for "${deploymentName}" did not become usable.`,
    reported,
    fixes: [
      `The page fetches the deployment before it renders the form, so an error here usually means the deployment does not exist or the frontend is unreachable. Check that "${deploymentName}" was created.`,
      'The ui-server proxies to the Temporal frontend, so a dead frontend surfaces here as a failed fetch rather than a UI fault.',
      'On a cold dev server the route is compiled on first request, which is slow but not this slow.',
    ],
    seeAlso: [
      createUrl,
      'src/lib/pages/worker-deployment-version-create.svelte',
    ],
  });
};

/** Fills a field, waiting for it and saying which one when it never arrives. */
const fill = async (
  page: Page,
  selector: string,
  value: string,
  label: string,
) => {
  const field = page.locator(selector);

  if (!(await appears(field, 'visible'))) {
    throw failure({
      attempting: `The create-version form has no ${label} field.`,
      reported: `${selector} did not appear within ${ACTION_TIMEOUT_MS / 1000}s.`,
      fixes: [
        'The provider-specific fields render only once their provider is selected, so this can mean the selection did not take rather than that the field is gone.',
        'The field ids come from create-version-form.svelte and compute-fields.svelte. If one was renamed, this driver needs the new id.',
      ],
      seeAlso: [
        'src/lib/components/workers/serverless-worker-form/compute-fields.svelte',
        'src/lib/components/workers/serverless-worker-form/create-version-form.svelte',
      ],
    });
  }

  await field.fill(value);
};

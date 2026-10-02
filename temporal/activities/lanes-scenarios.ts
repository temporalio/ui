import { ApplicationFailure, Context } from '@temporalio/activity';

/**
 * Activities for the Lanes scenario fixtures. Most are named no-ops with a
 * short delay; a few fail, retry or wait to be cancelled on purpose so the
 * timeline has every outcome to draw.
 */
const work = async (label: string, durationMs: number): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  return `${label}:ok`;
};

export async function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createAccount(email: string, durationMs = 400) {
  return work(`created ${email}`, durationMs);
}

export async function sendWelcomeEmail(email: string, durationMs = 300) {
  return work(`welcomed ${email}`, durationMs);
}

export async function provisionWorkspace(email: string, durationMs = 700) {
  return work(`provisioned ${email}`, durationMs);
}

export async function scheduleDripEmail(email: string, durationMs = 200) {
  return work(`scheduled drip for ${email}`, durationMs);
}

/** Runs on a task queue no worker serves, so it waits to be picked up. */
export async function notifySalesTeam(email: string, durationMs = 300) {
  return work(`notified sales about ${email}`, durationMs);
}

/** The CRM keeps rate-limiting, so this retries for as long as it runs. */
export async function syncCrmContact(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  throw ApplicationFailure.retryable(
    `CRM rate limited the sync for ${email}`,
    'RateLimited',
  );
}

export async function lookupOrder(orderId: string, durationMs = 350) {
  return work(`found ${orderId}`, durationMs);
}

export async function checkRefundPolicy(orderId: string) {
  return `eligible:${orderId}`;
}

export async function notifyCustomerOfRefund(
  orderId: string,
  durationMs = 250,
) {
  return work(`notified ${orderId}`, durationMs);
}

export async function scoreRefundRisk(orderId: string, durationMs = 300) {
  return work(`scored ${orderId}`, durationMs);
}

/** Holds stock until cancelled, heartbeating so the cancel reaches it. */
export async function holdInventory(orderId: string) {
  const context = Context.current();
  for (let tick = 0; tick < 300; tick++) {
    context.heartbeat(tick);
    await context.sleep(200);
  }
  return `held ${orderId}`;
}

/** Times out at the gateway twice, then learns the card account is closed. */
export async function issueRefund(orderId: string) {
  const { attempt } = Context.current().info;
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (attempt < 3) {
    throw ApplicationFailure.retryable(
      `Refund gateway timed out for ${orderId}`,
      'GatewayTimeout',
    );
  }
  throw ApplicationFailure.nonRetryable(
    `Card account for ${orderId} is closed`,
    'CardAccountClosed',
  );
}

export async function loadSyncCursor(page: number) {
  return `cursor-${page}`;
}

export async function fetchCatalogPage(cursor: string, durationMs = 600) {
  return work(`fetched ${cursor}`, durationMs);
}

export async function upsertProducts(region: string, durationMs = 450) {
  return work(`upserted ${region}`, durationMs);
}

/** The regional overrides service is flaky: it answers on the third try. */
export async function fetchRegionalOverrides(region: string) {
  const { attempt } = Context.current().info;
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (attempt < 3) {
    throw ApplicationFailure.retryable(
      `Overrides service unavailable for ${region}`,
      'ServiceUnavailable',
    );
  }
  return `overrides ${region}:ok`;
}

export async function rebuildPriceIndex(region: string, durationMs = 500) {
  return work(`indexed ${region}`, durationMs);
}

export async function publishCatalog(page: string, durationMs = 400) {
  return work(`published ${page}`, durationMs);
}

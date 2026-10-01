/**
 * Activities for the subscription-billing fixture. Each one is a named no-op
 * with a short delay: the fixture exists so the UI has realistic activity type
 * names to render, not to model real billing.
 */
const work = async (label: string, durationMs: number): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  return `${label}:ok`;
};

export async function loadAccountBatch(cursor: string, durationMs = 500) {
  return work(`loaded ${cursor}`, durationMs);
}

export async function rateUsageRecords(cursor: string, durationMs = 700) {
  return work(`rated ${cursor}`, durationMs);
}

export async function applyCreditsAndDiscounts(
  cursor: string,
  durationMs = 400,
) {
  return work(`credited ${cursor}`, durationMs);
}

export async function calculateTax(cursor: string, durationMs = 500) {
  return work(`taxed ${cursor}`, durationMs);
}

export async function postJournalEntries(cursor: string, durationMs = 900) {
  return work(`posted ${cursor}`, durationMs);
}

export async function refreshRevenueSchedule(cursor: string, durationMs = 600) {
  return work(`refreshed ${cursor}`, durationMs);
}

export async function issueInvoice(reference: string, durationMs = 400) {
  return work(`issued ${reference}`, durationMs);
}

export async function chargePaymentMethod(reference: string, durationMs = 600) {
  return work(`charged ${reference}`, durationMs);
}

export async function recordCollectionAttempt(
  reference: string,
  durationMs = 300,
) {
  return work(`recorded ${reference}`, durationMs);
}

export async function sendDunningNotice(reference: string, durationMs = 400) {
  return work(`notified ${reference}`, durationMs);
}

export async function suspendService(accountId: string, durationMs = 400) {
  return work(`suspended ${accountId}`, durationMs);
}

export async function emitBillingMetrics(cursor: string, durationMs = 300) {
  return work(`measured ${cursor}`, durationMs);
}

export async function closeBillingPeriod(cycleId: string, durationMs = 500) {
  return work(`closed ${cycleId}`, durationMs);
}

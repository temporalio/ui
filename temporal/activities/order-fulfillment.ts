/**
 * Activities for the order-fulfillment fixture. Each one is a named no-op with
 * a short delay: the fixture exists so the UI has realistic activity type names
 * to render, not to model real work.
 */
const work = async (label: string, durationMs: number): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  return `${label}:ok`;
};

export async function validateOrder(orderId: string, durationMs = 400) {
  return work(`validated ${orderId}`, durationMs);
}

export async function reserveInventory(orderId: string, durationMs = 600) {
  return work(`reserved ${orderId}`, durationMs);
}

export async function tokenizeCard(orderId: string, durationMs = 300) {
  return work(`tokenized ${orderId}`, durationMs);
}

export async function scoreTransaction(orderId: string, durationMs = 500) {
  return work(`scored ${orderId}`, durationMs);
}

export async function capturePayment(orderId: string, durationMs = 700) {
  return work(`captured ${orderId}`, durationMs);
}

export async function allocateStock(orderId: string, durationMs = 500) {
  return work(`allocated ${orderId}`, durationMs);
}

export async function renderInvoice(orderId: string, durationMs = 400) {
  return work(`rendered ${orderId}`, durationMs);
}

export async function bookCarrier(orderId: string, durationMs = 400) {
  return work(`booked ${orderId}`, durationMs);
}

export async function packItems(orderId: string, durationMs = 500) {
  return work(`packed ${orderId}`, durationMs);
}

export async function generateLabel(orderId: string, durationMs = 300) {
  return work(`labelled ${orderId}`, durationMs);
}

export async function schedulePickup(orderId: string, durationMs = 400) {
  return work(`scheduled ${orderId}`, durationMs);
}

export async function notifyCustomer(orderId: string, durationMs = 300) {
  return work(`notified ${orderId}`, durationMs);
}

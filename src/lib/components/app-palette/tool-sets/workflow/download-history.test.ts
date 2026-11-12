import { beforeEach, describe, expect, it, vi } from 'vitest';

const decoding = vi.hoisted(() => ({ active: 0, peak: 0 }));

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(async () => ({
    history: {
      events: [{ eventId: '1' }, { eventId: '2' }, { eventId: '3' }],
    },
  })),
}));

vi.mock('$lib/utilities/decode-payload', () => ({
  decodeEventAttributesForExport: vi.fn(async (event: object) => {
    decoding.active += 1;
    decoding.peak = Math.max(decoding.peak, decoding.active);
    await new Promise((resolve) => setTimeout(resolve, 1));
    decoding.active -= 1;
    return { ...event, decoded: true };
  }),
  parsePayloadAttributes: (attributes: object) => attributes,
}));

import { decodeEventAttributesForExport } from '$lib/utilities/decode-payload';

import { downloadHistory } from './download-history';

describe('downloadHistory', () => {
  beforeEach(() => {
    decoding.active = 0;
    decoding.peak = 0;
    URL.createObjectURL = vi.fn(() => 'blob:history');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('decodes one event at a time', async () => {
    await downloadHistory({
      namespace: 'ns',
      workflowId: 'order-1',
      runId: 'run-1',
      decodeSetting: 'readable',
    });
    expect(decodeEventAttributesForExport).toHaveBeenCalledTimes(3);
    expect(decoding.peak).toBe(1);
  });
});

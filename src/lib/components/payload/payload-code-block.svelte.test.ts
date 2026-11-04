import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DecodedPayloadState } from '$lib/runes/decoded-payload.svelte';
import type { Payload } from '$lib/types';
import { decodePayloadResult } from '$lib/utilities/decode-payload-result';

import PayloadCodeBlock from './payload-code-block.svelte';

vi.mock('$lib/utilities/decode-payload-result', () => ({
  decodePayloadResult: vi.fn(),
}));

const mockDecode = vi.mocked(decodePayloadResult);

const value = {
  metadata: {},
  data: 'ZW5jb2RlZC1wYXlsb2Fk',
} as unknown as Payload;

const decodedResults = [
  {
    decodedValue: { metadata: {}, data: 'decoded-payload' },
    originalValue: value,
  },
];

let component: ReturnType<typeof mount> | undefined;
let target: HTMLElement;

const render = (decoded?: DecodedPayloadState) => {
  target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(PayloadCodeBlock, {
    target,
    props: { value, decoded, label: 'Input' },
  });
  flushSync();
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('PayloadCodeBlock', () => {
  it('shows the encoded payload while a shared decode is loading', () => {
    render({ status: 'loading' });
    expect(target.textContent).toContain('ZW5jb2RlZC1wYXlsb2Fk');
    expect(target.textContent).not.toContain('Loading');
    expect(mockDecode).not.toHaveBeenCalled();
  });

  it('shows shared results without decoding again', () => {
    render({ status: 'success', results: decodedResults });
    expect(target.textContent).toContain('decoded-payload');
    expect(mockDecode).not.toHaveBeenCalled();
  });

  it('decodes the value itself when the shared decode is idle', async () => {
    mockDecode.mockResolvedValue(decodedResults);
    render({ status: 'idle' });
    await vi.waitFor(() =>
      expect(target.textContent).toContain('decoded-payload'),
    );
    expect(mockDecode).toHaveBeenCalledTimes(1);
  });

  it('decodes the value itself without a shared decode', async () => {
    mockDecode.mockResolvedValue(decodedResults);
    render();
    expect(target.textContent).toContain('ZW5jb2RlZC1wYXlsb2Fk');
    await vi.waitFor(() =>
      expect(target.textContent).toContain('decoded-payload'),
    );
    expect(mockDecode).toHaveBeenCalledTimes(1);
  });
});

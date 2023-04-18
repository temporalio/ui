import { noop } from 'svelte/internal';
import { vi } from 'vitest';

const BroadcastChannelMock = vi.fn(() => ({
  addEventListener: noop,
  postMessage: noop,
}));

vi.stubGlobal('BroadcastChannel', BroadcastChannelMock);

vi.mock('esm-env', () => {
  const BROWSER = true;
  return { BROWSER };
});

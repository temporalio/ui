import { vi } from 'vitest';

const BroadcastChannelMock = vi.fn(() => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addEventListener: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  postMessage: () => {},
}));

vi.stubGlobal('BroadcastChannel', BroadcastChannelMock);

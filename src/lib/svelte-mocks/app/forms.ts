import { vi } from 'vitest';

export const enhance = vi.fn(() => ({
  destroy: vi.fn(),
}));

export const applyAction = vi.fn();

export const deserialize = vi.fn();

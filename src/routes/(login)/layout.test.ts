import { describe, expect, it, vi } from 'vitest';

import { load } from './+layout';

vi.mock('$lib/services/settings-service', () => ({
  fetchSettings: vi.fn(async () => ({
    auth: {
      enabled: true,
      redirectToProvider: true,
      options: [],
    },
    baseUrl: 'https://t.io',
  })),
}));

const loadWith = (url: string) =>
  load({ fetch: vi.fn(), url: new URL(url) } as never);

describe('(login) layout', () => {
  it('redirects to the provider when redirectToProvider is enabled', async () => {
    await expect(loadWith('https://t.io/login')).rejects.toMatchObject({
      status: 302,
    });
  });

  it('shows the login page instead of redirecting to the provider when there is an error', async () => {
    await expect(
      loadWith('https://t.io/login?error=Forbidden'),
    ).resolves.toMatchObject({ settings: { baseUrl: 'https://t.io' } });
  });
});
